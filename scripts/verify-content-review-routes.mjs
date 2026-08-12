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
    reviewHtml.includes("Every student gets the support they qualify for"),
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
  countMatches(reviewHtml, /data-product-screen/g) === 6 &&
    countMatches(reviewHtml, /aria-label="Product location"/g) === 6 &&
    countMatches(reviewHtml, /<img[^>]+content-review\/screens\//g) === 6 &&
    countMatches(reviewHtml, /data-interface-description/g) === 0 &&
    countMatches(reviewHtml, /Question for the PM:/g) === 0 &&
    reviewHtml.includes("Student Insights") &&
    reviewHtml.includes("Read tracking"),
  "The content-review route lost its product screenshots or breadcrumb map."
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
const homeHtmlLower = homeHtml.toLowerCase()
const contentSource = process.env.CONTENT_SOURCE?.trim() || "static"

assert(
  !homeHtml.includes('<meta name="robots"') &&
    !/href="\/content-review(?:["?#]|\/(?!screens\/))/.test(homeHtml),
  "The public homepage inherited draft metadata or a link to the review route."
)

if (contentSource === "static") {
  assert(
    countMatches(homeHtml, /<title>/g) === 1 &&
      homeHtml.includes(
        "<title>Teacher Workspace. Every student. One View.</title>"
      ) &&
      homeHtml.includes("paper-page") &&
      !homeHtml.includes("data-teacher-preview"),
    "The static public homepage changed while adding content review."
  )
} else if (contentSource === "cms") {
  assert(
    countMatches(homeHtml, /<title>/g) === 1 &&
      homeHtml.includes(
        "<title>Teacher Workspace | Every student gets the support they qualify for</title>"
      ) &&
      countMatches(homeHtml, /<main\b/g) === 1 &&
      countMatches(homeHtml, /<h1\b/g) === 1 &&
      homeHtml.includes("data-teacher-preview") &&
      !homeHtml.includes("paper-page") &&
      !homeHtml.includes("data-review-pin"),
    "The CMS public homepage did not render the strict teacher publication."
  )
  for (const value of [
    "reviewdocument",
    "designintent",
    "editordisplayname",
    "versionnumber",
    "csrftoken",
    "private cms comparison",
  ]) {
    assert(
      !homeHtmlLower.includes(value),
      `The CMS public homepage exposed ${value}.`
    )
  }
  assert(
    !/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(
      homeHtml
    ),
    "The CMS public homepage exposed a stable identifier."
  )
} else {
  throw new Error(`Unexpected CONTENT_SOURCE: ${contentSource}`)
}

console.log(
  `Verified /content-review and the isolated ${contentSource} public homepage through the built Start handler.`
)
