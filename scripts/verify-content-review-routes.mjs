import { existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"

const serverEntryPath = fileURLToPath(
  new URL("../.output/server/_ssr/index.mjs", import.meta.url)
)

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length
}

async function render(server, path) {
  const response = await server.fetch(
    new Request(`http://content-review.test${path}`)
  )
  const html = await response.text()

  assert(response.status === 200, `${path} returned HTTP ${response.status}.`)
  assert(
    response.headers.get("content-type")?.includes("text/html"),
    `${path} did not return HTML.`
  )

  return html
}

if (!existsSync(serverEntryPath)) {
  throw new Error(
    "The built TanStack Start server entry is missing. Run the production build before this check."
  )
}

const serverModule = await import(pathToFileURL(serverEntryPath).href)
const server = serverModule.default
assert(
  typeof server?.fetch === "function",
  "The built TanStack Start server does not expose a fetch handler."
)

const reviewHtml = await render(server, "/content-review")
const reviewHtmlLower = reviewHtml.toLowerCase()

assert(
  countMatches(reviewHtml, /<title>/g) === 1 &&
    reviewHtml.includes(
      "<title>Teacher Workspace landing wireframe — Draft</title>"
    ),
  "The content-review route did not resolve exactly one wireframe draft title."
)
assert(
  countMatches(reviewHtml, /<meta name="description"/g) === 1,
  "The content-review route did not resolve exactly one description."
)
assert(
  countMatches(reviewHtml, /<meta name="robots"/g) === 1 &&
    reviewHtml.includes('<meta name="robots" content="noindex, nofollow"/>'),
  "The content-review route is missing its noindex, nofollow policy."
)
assert(
  countMatches(reviewHtml, /<main\b/g) === 1 &&
    countMatches(reviewHtml, /<h1\b/g) === 1 &&
    reviewHtml.includes('<main id="main"') &&
    reviewHtml.includes("Every student. No support left unclaimed."),
  "The content-review route does not render one main landmark and one H1."
)
assert(
  reviewHtml.includes('href="#main"') &&
    reviewHtml.includes("Skip to main content"),
  "The content-review route lost its working skip link."
)
assert(
  !reviewHtmlLower.includes('rel="canonical"') &&
    !reviewHtmlLower.includes('property="og:image"') &&
    !reviewHtmlLower.includes('name="twitter:image"') &&
    !reviewHtmlLower.includes('rel="preload"'),
  "The content-review route published canonical, social-image, or preload metadata."
)
assert(
  countMatches(reviewHtml, /data-interface-description/g) === 6 &&
    countMatches(reviewHtml, /data-wireframe-placeholder/g) === 0 &&
    reviewHtml.includes("Class view with one synthetic student") &&
    reviewHtml.includes("No conduct or attention markers"),
  "The content-review route lost its complete set of descriptive interface briefs."
)

const prohibitedReviewOutput = [
  "contentid",
  "reviewedsnapshot",
  "evidencereference",
  "reviewreference",
  "contentkind",
  "itemsnapshot",
  "iaordersnapshot",
  "storysnapshot",
  "artifactreview",
  "concerns",
  "prohibiteddata",
  "v2-sha256",
  "tw-",
  "requiredreviewers",
  "remainingreviewers",
  "sourcelabel",
  "blockers",
  "teacher.digital.moe.gov.sg",
  "teacherworkspace-feedback",
  "contextual-intelligence",
  "hey-talia",
  "xingyu",
  "swan",
]
for (const value of prohibitedReviewOutput) {
  assert(
    !reviewHtmlLower.includes(value),
    `The rendered content-review route contains prohibited value: ${value}.`
  )
}

const homeHtml = await render(server, "/")
assert(
  countMatches(homeHtml, /<title>/g) === 1 &&
    homeHtml.includes(
      "<title>Teacher Workspace. Every student. One View.</title>"
    ),
  "The public homepage title changed while adding content review."
)
assert(
  !homeHtml.includes('<meta name="robots"') &&
    !/href="\/content-review(?:["?#/])/.test(homeHtml) &&
    homeHtml.includes("paper-page"),
  "The public homepage inherited draft metadata, links to the review route, or lost its existing shell."
)

console.log(
  "Verified /content-review through the built Start handler and confirmed / remains isolated."
)
