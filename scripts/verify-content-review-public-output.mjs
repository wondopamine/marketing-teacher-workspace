import { existsSync, readdirSync, readFileSync } from "node:fs"
import { basename, extname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

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
  ["student-support classification", "swan"],
  ["internal capability id", "contextual-intelligence"],
  ["internal agent id", "hey-talia"],
  ["raw review reference field", "reviewreference"],
  ["raw content-kind field", "contentkind"],
  ["raw item snapshot field", "itemsnapshot"],
  ["raw IA snapshot field", "iaordersnapshot"],
  ["raw story snapshot field", "storysnapshot"],
  ["raw artifact-review field", "artifactreview"],
  ["raw review-concern field", "concerns"],
  ["unused synthetic-data field", "prohibiteddata"],
  ["raw snapshot value", "v2-sha256"],
  ["raw review reference", "tw-"],
  ["unused product destination", "teacher.digital.moe.gov.sg"],
  ["unused feedback destination", "teacherworkspace-feedback"],
]

function publicFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return publicFiles(path)
      return scannedExtensions.has(extname(entry.name)) ? [path] : []
    })
}

function scan(outputDirectory, paths, prohibitedValues) {
  return paths.flatMap((path) => {
    const contents = readFileSync(path, "utf8").toLowerCase()
    return prohibitedValues
      .filter(([, value]) => contents.includes(value))
      .map(([label]) => `${label}: ${relative(outputDirectory, path)}`)
  })
}

export function verifyContentReviewPublicOutput(
  outputDirectory = fileURLToPath(new URL("../.output/public", import.meta.url))
) {
  if (!existsSync(outputDirectory)) {
    throw new Error(
      "Public build output is missing. Run the production build before this check."
    )
  }

  const files = publicFiles(outputDirectory)
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

  const findings = [
    ...scan(outputDirectory, files, globallyProhibitedValues),
    ...scan(outputDirectory, reviewFiles, routeProhibitedValues),
  ]

  if (findings.length > 0) {
    throw new Error(
      `Known prohibited value found in public build output:\n${findings.join("\n")}`
    )
  }

  return {
    fileCount: files.length,
    reviewFileCount: reviewFiles.length,
  }
}

const moduleUrl = new URL(import.meta.url)
const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (
  moduleUrl.protocol === "file:" &&
  invokedPath === fileURLToPath(moduleUrl)
) {
  const { fileCount, reviewFileCount } = verifyContentReviewPublicOutput()
  console.log(
    `Checked ${fileCount} public build files and ${reviewFileCount} content-review chunks; no known denylisted values found.`
  )
}
