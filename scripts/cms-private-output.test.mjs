import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import {
  optionValue,
  resolvePrivateOutput,
  writePrivateFile,
} from "./cms-private-output.mjs"

const roots = new Set()

function fixtureRoot() {
  const root = mkdtempSync(join(tmpdir(), "cms-private-output-"))
  roots.add(root)
  return root
}

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
  roots.clear()
})

describe("CMS private backup output", () => {
  it("resolves explicit output options", () => {
    expect(
      optionValue(["--path", "/", "--output", "backup.json"], "--output")
    ).toBe("backup.json")
    expect(() => optionValue(["--output"], "--output")).toThrow(
      "--output needs a value"
    )
  })

  it("allows a new private backup file and protects public build areas", () => {
    const root = fixtureRoot()
    mkdirSync(join(root, "backups"))
    expect(
      resolvePrivateOutput({
        rawPath: "backups/publication.json",
        extension: ".json",
        force: false,
        cwd: root,
      })
    ).toBe(join(root, "backups/publication.json"))

    expect(() =>
      resolvePrivateOutput({
        rawPath: "public/publication.json",
        extension: ".json",
        force: false,
        cwd: root,
      })
    ).toThrow("Backup output cannot be written inside public")
  })

  it("will not replace an existing backup unless force is explicit", () => {
    const root = fixtureRoot()
    const output = join(root, "publication.json")
    writeFileSync(output, "existing")

    expect(() =>
      resolvePrivateOutput({
        rawPath: output,
        extension: ".json",
        force: false,
        cwd: root,
      })
    ).toThrow("already exists")
    expect(
      resolvePrivateOutput({
        rawPath: output,
        extension: ".json",
        force: true,
        cwd: root,
      })
    ).toBe(output)
  })

  it("atomically replaces a forced export and tightens old permissions", async () => {
    const root = fixtureRoot()
    const output = join(root, "publication.json")
    writeFileSync(output, "old export")
    chmodSync(output, 0o644)

    await writePrivateFile({
      output,
      contents: "private snapshot\n",
      force: true,
    })

    expect(readFileSync(output, "utf8")).toBe("private snapshot\n")
    expect(statSync(output).mode & 0o777).toBe(0o600)
    expect(readdirSync(root).some((name) => name.includes(".partial-"))).toBe(
      false
    )
  })

  it("does not clobber a backup created while a new file is prepared", async () => {
    const root = fixtureRoot()
    const output = join(root, "database.dump")
    writeFileSync(output, "last good backup")

    await expect(
      writePrivateFile({
        output,
        contents: "new backup",
        force: false,
      })
    ).rejects.toMatchObject({ code: "EEXIST" })

    expect(readFileSync(output, "utf8")).toBe("last good backup")
    expect(readdirSync(root).some((name) => name.includes(".partial-"))).toBe(
      false
    )
  })
})
