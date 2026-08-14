import { existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"

const serverEntryPath = fileURLToPath(
  new URL("../.output/server/_ssr/index.mjs", import.meta.url)
)

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function request(server, path) {
  const response = await server.fetch(
    new Request(`https://cms-public-source.test${path}`)
  )
  return { response, html: await response.text() }
}

if (!existsSync(serverEntryPath)) {
  throw new Error("Build the app before checking the public content switch")
}

const serverModule = await import(pathToFileURL(serverEntryPath).href)
const server = serverModule.default
assert(
  typeof server?.fetch === "function",
  "The built server handler is missing"
)

const originalSource = process.env.CONTENT_SOURCE
try {
  process.env.CONTENT_SOURCE = "cms"
  const cms = await request(server, "/")
  const cmsLower = cms.html.toLowerCase()
  assert(cms.response.status === 200, "CMS mode did not serve the homepage")
  assert(
    cms.html.includes("data-teacher-preview") &&
      cms.html.includes("See what is changing. Know what to do next.") &&
      cms.html.includes('href="https://teacher.digital.moe.gov.sg"') &&
      cms.html.includes('href="https://go.gov.sg/teacherworkspace-feedback"') &&
      !cms.html.includes("paper-page"),
    "CMS mode did not serve the exact published teacher page with live public actions"
  )
  assert(
    (cms.html.match(/href="https:\/\/teacher\.digital\.moe\.gov\.sg"/g) ?? [])
      .length === 2,
    "The public CMS page did not render both product actions"
  )
  for (const value of [
    "reviewdocument",
    "designintent",
    "editordisplayname",
    "versionnumber",
    "csrftoken",
  ]) {
    assert(!cmsLower.includes(value), `The public CMS page exposed ${value}`)
  }
  assert(
    !/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(
      cms.html
    ),
    "The public CMS page exposed a stable identifier"
  )

  const missingCms = await request(server, "/not-a-published-page")
  assert(
    missingCms.response.status === 404 &&
      missingCms.html.includes("Page not found") &&
      missingCms.html.includes("Go to homepage"),
    "CMS mode did not return a clear 404 for an unpublished path"
  )
  const missingDeepPath = await request(server, "/not/a-published-page")
  assert(
    missingDeepPath.response.status === 404 &&
      missingDeepPath.html.includes("Page not found") &&
      missingDeepPath.html.includes("Go to homepage"),
    "The root 404 did not give visitors a route back to the homepage"
  )

  process.env.CONTENT_SOURCE = "static"
  const restored = await request(server, "/")
  assert(
    restored.response.status === 200 &&
      restored.html.includes("paper-page") &&
      !restored.html.includes("data-teacher-preview"),
    "The static rollback switch did not restore the released homepage"
  )
  const missingStatic = await request(server, "/not-a-published-page")
  assert(
    missingStatic.response.status === 404 &&
      missingStatic.html.includes("Page not found") &&
      missingStatic.html.includes("Go to homepage"),
    "Static mode exposed a CMS-backed public path"
  )
} finally {
  if (originalSource === undefined) delete process.env.CONTENT_SOURCE
  else process.env.CONTENT_SOURCE = originalSource
}

console.log(
  "Verified the CMS public source, strict public output, dynamic-path gate, and static rollback switch."
)
