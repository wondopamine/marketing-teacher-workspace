import { existsSync, readdirSync, readFileSync } from "node:fs"
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path"
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
// Keep generic review-UI and browser words (for example `rationale`, `href`,
// `history`, and `target`) out of this bundle denylist. The route legitimately
// implements those concepts; the server adapter contract rejects them as DTO
// keys before loader data reaches the browser.
const routeProhibitedValues = [
  ["internal person name", "xingyu"],
  ["student-support classification", "swan"],
  ["internal capability id", "contextual-intelligence"],
  ["internal agent id", "hey-talia"],
  ["raw stable content id field", "contentid"],
  ["raw review reference field", "reviewreference"],
  ["raw content-kind field", "contentkind"],
  ["raw item snapshot field", "itemsnapshot"],
  ["raw IA snapshot field", "iaordersnapshot"],
  ["raw story snapshot field", "storysnapshot"],
  ["raw artifact-review field", "artifactreview"],
  [
    "raw review-concern field",
    /(?:["']concerns["']\s*:|[,{]\s*concerns\s*:|\.\s*concerns\b)/,
  ],
  ["raw governance field", "governance"],
  ["raw required-reviewers field", "requiredreviewers"],
  ["raw remaining-reviewers field", "remainingreviewers"],
  ["raw review source-label field", "sourcelabel"],
  [
    "raw review blocker field",
    /(?:["']blockers["']\s*:|[,{]\s*blockers\s*:|\.\s*blockers\b)/,
  ],
  ["raw schema-version field", "schemaversion"],
  ["unused synthetic-data field", "prohibiteddata"],
  ["raw snapshot value", "v2-sha256"],
  [
    "raw review reference",
    /\btw-(?:audience|cap|close|cta|feedback|footer|ia|meta|promise|proof|reveal|section|story|support)(?:-[a-z0-9]+)*\b/,
  ],
  ["unused product destination", "teacher.digital.moe.gov.sg"],
  ["unused feedback destination", "teacherworkspace-feedback"],
]

const scriptExtensions = new Set([".cjs", ".js", ".mjs"])

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
      .filter(([, value]) =>
        typeof value === "string"
          ? contents.includes(value)
          : value.test(contents)
      )
      .map(([label]) => `${label}: ${relative(outputDirectory, path)}`)
  })
}

function staticImportSpecifiers(contents) {
  const specifiers = []
  const patterns = [
    /\bimport(?!\s*\()\s*(?:[^"'();]*?from\s*)?["']([^"']+)["']/g,
    /\bexport\s*(?:\*|\{[^}]*\})\s*from\s*["']([^"']+)["']/g,
  ]

  for (const pattern of patterns) {
    for (const match of contents.matchAll(pattern)) {
      specifiers.push(match[1])
    }
  }

  return specifiers
}

function dynamicImportSpecifiers(contents) {
  return [...contents.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)].map(
    (match) => match[1]
  )
}

function isWithinDirectory(directory, path) {
  const relativePath = relative(directory, path)
  return (
    relativePath === "" ||
    (!isAbsolute(relativePath) &&
      relativePath !== ".." &&
      !relativePath.startsWith(`..${sep}`))
  )
}

function resolvePublicImport(outputDirectory, importer, specifier, files) {
  const cleanSpecifier = specifier.split(/[?#]/, 1)[0]
  if (!cleanSpecifier.startsWith(".") && !cleanSpecifier.startsWith("/")) {
    return null
  }

  const importedPath = cleanSpecifier.startsWith("/")
    ? resolve(outputDirectory, `.${cleanSpecifier}`)
    : resolve(dirname(importer), cleanSpecifier)

  if (!isWithinDirectory(outputDirectory, importedPath)) return null
  return files.has(importedPath) ? importedPath : null
}

function contentReviewDependencyFiles(outputDirectory, files) {
  const fileSet = new Set(files.map((path) => resolve(path)))
  const entryFiles = files.filter(
    (path) =>
      scriptExtensions.has(extname(path)) &&
      basename(path).startsWith("content-review-")
  )

  if (entryFiles.length === 0) return []

  const entryFileSet = new Set(entryFiles.map((path) => resolve(path)))
  const reviewFiles = new Set(entryFileSet)
  const queue = [...reviewFiles]

  while (queue.length > 0) {
    const importer = queue.shift()
    if (!scriptExtensions.has(extname(importer))) continue

    const contents = readFileSync(importer, "utf8")
    // Static imports form the route's dependency closure. A direct dynamic
    // import from the named route entry belongs to the route too. Do not follow
    // dynamic imports from shared router chunks: those include the lazy `/`
    // sibling and would turn route-specific checks into false positives on
    // homepage copy.
    const specifiers = staticImportSpecifiers(contents)
    if (entryFileSet.has(importer)) {
      specifiers.push(...dynamicImportSpecifiers(contents))
    }
    for (const specifier of specifiers) {
      const dependency = resolvePublicImport(
        outputDirectory,
        importer,
        specifier,
        fileSet
      )
      if (!dependency || reviewFiles.has(dependency)) continue
      reviewFiles.add(dependency)
      queue.push(dependency)
    }
  }

  for (const path of [...reviewFiles]) {
    const sourceMap = `${path}.map`
    if (fileSet.has(sourceMap)) reviewFiles.add(sourceMap)
  }

  return [...reviewFiles].sort((left, right) => left.localeCompare(right))
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

  const reviewFiles = contentReviewDependencyFiles(outputDirectory, files)
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
    `Checked ${fileCount} public build files and ${reviewFileCount} content-review dependency files; no known denylisted values found.`
  )
}
