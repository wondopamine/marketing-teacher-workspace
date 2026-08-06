import { readFile, readdir, writeFile } from "node:fs/promises"
import { join, relative, resolve, sep } from "node:path"

import { applyEdit, collectEditableSpans } from "./mdx-editable"
import { parseMdx } from "./mdx-parse"

import type { EditableSpan } from "./mdx-editable"
import type { Connect, Plugin } from "vite"

/**
 * Compiles every `.mdx` file under `content/` into a plain data module at
 * build time. Nothing parses markdown at runtime, and a malformed file fails
 * the dev server or the build with a message naming the file.
 *
 * On the dev server only, it also serves the two endpoints behind `⌘K` edit
 * mode: a map of every editable string with its source range, and a write
 * endpoint that splices one edit back into its `.mdx` file.
 */

const contentRoot = "content"

async function mdxFiles(directory: string): Promise<Array<string>> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return mdxFiles(path)
      return entry.name.endsWith(".mdx") ? [path] : []
    })
  )
  return files.flat().sort()
}

/** Refuses any path that escapes `content/`, even on a local dev server. */
function safeContentPath(root: string, file: string): string | null {
  const base = resolve(root, contentRoot)
  const target = resolve(root, file)
  const inside = target === base || target.startsWith(base + sep)
  return inside && target.endsWith(".mdx") ? target : null
}

async function readBody(request: Connect.IncomingMessage): Promise<unknown> {
  const chunks: Array<Buffer> = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"))
  } catch {
    return null
  }
}

function json(
  response: { setHeader: (k: string, v: string) => void; end: (b: string) => void; statusCode: number },
  status: number,
  body: unknown
): void {
  response.statusCode = status
  response.setHeader("content-type", "application/json")
  response.end(JSON.stringify(body))
}

export function mdxContent(): Plugin {
  let root = process.cwd()

  return {
    name: "teacher-workspace:mdx-content",
    enforce: "pre",

    configResolved(config) {
      root = config.root
    },

    transform(source, id) {
      const path = id.split("?")[0]
      if (!path.endsWith(".mdx")) return null

      const document = parseMdx(relative(root, path), source)
      return {
        code: `export default ${JSON.stringify(document)}`,
        map: null,
      }
    },

    configureServer(server) {
      server.middlewares.use("/__content/map", (request, response, next) => {
        if (request.method !== "GET") return next()

        void (async () => {
          try {
            const files = await mdxFiles(resolve(root, contentRoot))
            const spans: Array<EditableSpan> = []
            for (const file of files) {
              const source = await readFile(file, "utf8")
              spans.push(
                ...collectEditableSpans(relative(root, file), source)
              )
            }
            json(response, 200, { spans })
          } catch (error) {
            json(response, 500, { error: (error as Error).message })
          }
        })()
      })

      server.middlewares.use("/__content/edit", (request, response, next) => {
        if (request.method !== "POST") return next()

        void (async () => {
          const body = (await readBody(request)) as {
            file?: string
            start?: number
            end?: number
            was?: string
            text?: string
            kind?: "frontmatter" | "prose"
          } | null

          if (
            !body ||
            typeof body.file !== "string" ||
            typeof body.start !== "number" ||
            typeof body.end !== "number" ||
            typeof body.was !== "string" ||
            typeof body.text !== "string" ||
            (body.kind !== "frontmatter" && body.kind !== "prose")
          ) {
            return json(response, 400, { error: "Malformed edit." })
          }

          const path = safeContentPath(root, body.file)
          if (!path) {
            return json(response, 400, {
              error: "Only .mdx files under content/ can be edited.",
            })
          }

          try {
            const source = await readFile(path, "utf8")
            const result = applyEdit(source, {
              start: body.start,
              end: body.end,
              was: body.was,
              text: body.text,
              kind: body.kind,
            })
            if (!result.ok) {
              return json(response, 409, { error: result.reason })
            }
            await writeFile(path, result.source, "utf8")
            json(response, 200, { ok: true })
          } catch (error) {
            json(response, 500, { error: (error as Error).message })
          }
        })()
      })
    },
  }
}
