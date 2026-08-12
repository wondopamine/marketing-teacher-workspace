import { randomUUID } from "node:crypto"
import { existsSync } from "node:fs"
import { chmod, link, mkdir, rename, unlink, writeFile } from "node:fs/promises"
import { dirname, isAbsolute, relative, resolve, sep } from "node:path"

const protectedDirectories = [".git", ".output", "node_modules", "public"]

function isWithin(parent, child) {
  const path = relative(parent, child)
  return (
    path === "" ||
    (!isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`))
  )
}

export function optionValue(args, name) {
  const index = args.indexOf(name)
  if (index === -1) return null
  const value = args[index + 1]
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} needs a value`)
  }
  return value
}

export function resolvePrivateOutput({
  rawPath,
  extension,
  force,
  cwd = process.cwd(),
}) {
  if (!rawPath) throw new Error("--output is required")
  const output = resolve(cwd, rawPath)
  if (!output.endsWith(extension)) {
    throw new Error(`--output must end with ${extension}`)
  }
  for (const directory of protectedDirectories) {
    if (isWithin(resolve(cwd, directory), output)) {
      throw new Error(`Backup output cannot be written inside ${directory}`)
    }
  }
  if (existsSync(output) && !force) {
    throw new Error(`${output} already exists; pass --force to replace it`)
  }
  return output
}

export async function finalisePrivateFile({ partial, output, force }) {
  try {
    await chmod(partial, 0o600)
    if (force) {
      await rename(partial, output)
    } else {
      await link(partial, output)
      await unlink(partial)
    }
    await chmod(output, 0o600)
  } catch (error) {
    await unlink(partial).catch(() => undefined)
    throw error
  }
}

export async function writePrivateFile({ output, contents, force }) {
  const partial = `${output}.partial-${randomUUID()}`
  await mkdir(dirname(output), { recursive: true })
  try {
    await writeFile(partial, contents, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    })
    await finalisePrivateFile({ partial, output, force })
  } catch (error) {
    await unlink(partial).catch(() => undefined)
    throw error
  }
}
