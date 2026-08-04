import { existsSync, readdirSync, readFileSync } from "node:fs"
import { basename, extname, join } from "node:path"
import { fileURLToPath } from "node:url"

const publicOutput = fileURLToPath(
  new URL("../.output/public", import.meta.url)
)
const scannedExtensions = new Set([
  ".cjs",
  ".html",
  ".js",
  ".json",
  ".map",
  ".mjs",
])
const globallyProhibitedValues = [
  ["superseded story source", "issuecomment-4977836365"],
  ["raw internal content id", "section.connected-story"],
  ["raw review snapshot field", "reviewedsnapshot"],
  ["raw evidence field", "evidencereference"],
  ["raw source field", "bursaryexamplecomment"],
  [
    "unapproved testimonial fragment",
    "a lot of enhancements have been made to facilitate",
  ],
]
const routeProhibitedValues = [
  ["internal person name", "xingyu"],
  ["superseded student name", "xiao ming"],
  ["superseded bursary story", "bursary"],
  ["internal capability id", "contextual-intelligence"],
  ["internal agent id", "hey-talia"],
]

function publicFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return publicFiles(path)
    return scannedExtensions.has(extname(entry.name)) ? [path] : []
  })
}

if (!existsSync(publicOutput)) {
  throw new Error(
    "Public build output is missing. Run the production build before this check."
  )
}

const files = publicFiles(publicOutput)
if (files.length === 0) {
  throw new Error("Public build output contains no scannable files.")
}

const reviewFiles = files.filter((path) =>
  basename(path).startsWith("content-review-")
)
if (reviewFiles.length === 0) {
  throw new Error(
    "The public build is missing the content-review client chunk."
  )
}

function scan(paths, prohibitedValues) {
  return paths.flatMap((path) => {
    const contents = readFileSync(path, "utf8").toLowerCase()
    return prohibitedValues
      .filter(([, value]) => contents.includes(value))
      .map(([label]) => `${label}: ${path}`)
  })
}

const findings = [
  ...scan(files, globallyProhibitedValues),
  ...scan(reviewFiles, routeProhibitedValues),
]

if (findings.length > 0) {
  throw new Error(
    `Known prohibited value found in public build output:\n${findings.join("\n")}`
  )
}

console.log(
  `Checked ${files.length} public build files and ${reviewFiles.length} content-review chunks; no known denylisted values found.`
)
