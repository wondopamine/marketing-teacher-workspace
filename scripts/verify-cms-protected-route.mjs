import { existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"

const serverEntryPath = fileURLToPath(
  new URL("../.output/server/_ssr/index.mjs", import.meta.url)
)

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

if (!process.env.CMS_TEST_EDIT_KEY) {
  throw new Error("CMS_TEST_EDIT_KEY is required")
}
if (!existsSync(serverEntryPath)) {
  throw new Error("Build the app before checking the protected CMS route")
}

const serverModule = await import(pathToFileURL(serverEntryPath).href)
const server = serverModule.default
assert(typeof server?.fetch === "function", "The built server handler is missing")
const origin = "https://cms-preview.test"

const lockedResponse = await server.fetch(
  new Request(`${origin}/cms-preview`)
)
const lockedHtml = await lockedResponse.text()
assert(lockedResponse.status === 200, "The locked CMS route did not render")
assert(
  lockedHtml.includes("This preview needs the shared edit link."),
  "The CMS route did not stay locked without a capability cookie"
)
assert(
  !lockedHtml.includes("Every student gets the support they qualify for"),
  "The locked CMS route exposed the stored page"
)

const lockedComparisonResponse = await server.fetch(
  new Request(`${origin}/cms-compare`)
)
const lockedComparisonHtml = await lockedComparisonResponse.text()
assert(
  lockedComparisonResponse.status === 200 &&
    lockedComparisonHtml.includes("This comparison needs the shared edit link."),
  "The published comparison did not stay locked without a capability cookie"
)

const exchangeResponse = await server.fetch(
  new Request(
    `${origin}/api/cms/session?key=${encodeURIComponent(process.env.CMS_TEST_EDIT_KEY)}`
  )
)
const setCookie = exchangeResponse.headers.get("set-cookie") ?? ""
assert(exchangeResponse.status === 303, "The edit link was not exchanged")
assert(
  exchangeResponse.headers.get("location") === "/cms-preview",
  "The edit link did not redirect to the CMS preview"
)
assert(setCookie.includes("HttpOnly"), "The capability cookie is not HTTP-only")
assert(
  !setCookie.includes(process.env.CMS_TEST_EDIT_KEY),
  "The raw edit key was copied into the session cookie"
)

const cookie = setCookie.split(";", 1)[0]
const readyResponse = await server.fetch(
  new Request(`${origin}/cms-preview`, {
    headers: { cookie },
  })
)
const readyHtml = await readyResponse.text()
assert(readyResponse.status === 200, "The authorised CMS route did not render")
assert(
  readyHtml.includes("Every student gets the support they qualify for") &&
    readyHtml.includes("One student, carried through every moment"),
  "The authorised CMS route did not read the imported page"
)
assert(
  readyResponse.headers.get("cache-control") === "private, no-store",
  "The protected CMS response can be cached"
)

const comparisonResponse = await server.fetch(
  new Request(`${origin}/cms-compare`, {
    headers: { cookie },
  })
)
const comparisonHtml = await comparisonResponse.text()
const comparisonHtmlLower = comparisonHtml.toLowerCase()
assert(
  comparisonResponse.status === 200 &&
    comparisonHtml.includes("Private CMS comparison") &&
    comparisonHtml.includes("Every student gets the support they qualify for"),
  "The private comparison did not render the CMS publication"
)
assert(
  comparisonResponse.headers.get("cache-control") === "private, no-store",
  "The private comparison can be cached"
)
for (const value of [
  "reviewdocument",
  "designintent",
  "editordisplayname",
  "versionnumber",
  "csrftoken",
]) {
  assert(
    !comparisonHtmlLower.includes(value),
    `The private comparison hydration exposed ${value}`
  )
}
assert(
  !/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(
    comparisonHtml
  ),
  "The private comparison hydration exposed a stable CMS identifier"
)

const publicResponse = await server.fetch(new Request(`${origin}/`))
const publicHtml = await publicResponse.text()
assert(
  publicResponse.status === 200 && publicHtml.includes("paper-page"),
  "The released homepage changed during CMS shadow publishing"
)
assert(
  !publicHtml.includes("Private CMS comparison"),
  "The released homepage inherited private comparison chrome"
)

console.log(
  "Verified the shared edit link, protected CMS reads, private published comparison, and unchanged released homepage."
)
