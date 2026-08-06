import { relative } from "node:path"

import { parseMdx } from "./mdx-parse"

import type { Plugin } from "vite"

/**
 * Compiles every `.mdx` file under `content/` into a plain data module at
 * build time. Nothing parses markdown at runtime, and a malformed file fails
 * the dev server or the build with a message naming the file.
 */
export function mdxContent(): Plugin {
  return {
    name: "teacher-workspace:mdx-content",
    enforce: "pre",
    transform(source, id) {
      const path = id.split("?")[0]
      if (!path.endsWith(".mdx")) return null

      const document = parseMdx(relative(process.cwd(), path), source)
      return {
        code: `export default ${JSON.stringify(document)}`,
        map: null,
      }
    },
  }
}
