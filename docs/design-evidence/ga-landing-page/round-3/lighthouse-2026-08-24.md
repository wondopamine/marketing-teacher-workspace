# Lighthouse — GA landing page vs the released page

Measured 2026-08-24 to close the round-3 performance gate ("a measured
Lighthouse run", open since the hero video landed). Lighthouse 13.4.1,
headless Chrome 3 runs per configuration, medians reported.

## Method

Both pages were built and served from their own production output, so the
comparison is like for like:

- **Candidate:** this branch at the commit under review,
  `CONTENT_SOURCE=static pnpm build`, served with
  `CONTENT_SOURCE=static PORT=4173 node .output/server/index.mjs`.
- **Baseline:** `main` (the page released at `/` today) in a second worktree,
  `pnpm install --frozen-lockfile && pnpm build`, served on port 4174.

The built Nitro server sends **no `content-encoding`**, so a run against it
charges full uncompressed weight for HTML, CSS and JS — Vercel serves those
brotli-compressed. Both pages were therefore also measured through a small
proxy that brotli-compresses text and marks `/assets` and `/hero`
`immutable`, which is the realistic condition and the one the verdict rests
on. Numbers from the raw origin are kept as the pessimistic bound.

```js
// brotli-proxy.mjs — node brotli-proxy.mjs <listen> <origin>
import http from "node:http"
import zlib from "node:zlib"
const [LISTEN, ORIGIN] = process.argv.slice(2).map(Number)
const TEXT = /text\/|javascript|json|xml|svg/
http
  .createServer(async (req, res) => {
    const upstream = await fetch(`http://localhost:${ORIGIN}${req.url}`)
    const buf = Buffer.from(await upstream.arrayBuffer())
    const type = upstream.headers.get("content-type") ?? "application/octet-stream"
    const headers = { "content-type": type }
    if (req.url.startsWith("/assets/") || req.url.startsWith("/hero/")) {
      headers["cache-control"] = "public, max-age=31536000, immutable"
    }
    if ((req.headers["accept-encoding"] ?? "").includes("br") && TEXT.test(type)) {
      const out = zlib.brotliCompressSync(buf, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 },
      })
      res.writeHead(upstream.status, { ...headers, "content-encoding": "br", "content-length": out.length })
      return res.end(out)
    }
    res.writeHead(upstream.status, { ...headers, "content-length": buf.length })
    res.end(buf)
  })
  .listen(LISTEN)
```

```sh
pnpm dlx lighthouse http://localhost:5173/ --output=json \
  --output-path=mobile-r1.json \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new --autoplay-policy=no-user-gesture-required"
# add --preset=desktop for the desktop rows
```

`--autoplay-policy=no-user-gesture-required` matches a real browser, which
plays the muted hero loop; without it the 1.9MB video is never fetched and the
run flatters the page.

## Results — through the compressing proxy (the realistic condition)

Medians of 3 runs.

| | GA landing (this branch) | Released page (`main`) | Δ |
| --- | --- | --- | --- |
| Performance (mobile) | **88** | 73 | **+15** |
| Performance (desktop) | **100** | 77 | **+23** |
| Accessibility | **100** | 95 | **+5** |
| Best practices | **100** | 100 | 0 |
| SEO | **100** | 91 | **+9** |
| FCP (mobile) | 2.64s | 1.97s | −0.67s |
| LCP (mobile) | **3.40s** | 23.84s | **−20.4s** |
| LCP (desktop) | **0.70s** | 4.81s | −4.11s |
| CLS | 0.001 | 0.000 | +0.001 |
| TBT | 0ms | 0ms | 0 |
| Total transfer | **2.38MB** | 8.76MB | −6.38MB |

FCP is the one metric that is worse than the released page: this page ships a
larger stylesheet and a larger document, and both paint before anything else
can. It costs 0.67s on a throttled mobile link and is the main remaining lever
if the score is ever pushed higher.

## Results — raw origin, no compression (pessimistic bound)

Medians of 3 runs, mobile.

| | GA landing | Released page (`main`) |
| --- | --- | --- |
| Performance | 64 | 65 |
| LCP | 6.38s | 30.61s |
| Total transfer | 2.93MB | 9.17MB |

Uncompressed, the two pages score the same within noise: the GA page's larger
CSS and HTML cost exactly what its lighter media saves. Vercel compresses
text and not media, which is why the compressed condition separates them.

## What the first run found, and what changed because of it

| | first measured run | after the two fixes |
| --- | --- | --- |
| Performance (mobile, compressed) | 86 | 88 |
| Performance (mobile, raw) | 61 | 64 |
| Performance (desktop, raw) | 88 | 95 |
| Best practices | 96 | 100 |
| Total transfer | 4.01MB | 2.38MB |

1. **The halftone cloud was 1.1MB of PNG, drawn twice.** Served as AVIF
   (66KB) with a WebP tier (194KB) and the PNG kept as the last-resort
   `<img>` source. Fidelity checked by decoding both and compositing over the
   sky at the largest rendered width: mean delta 0.47/255, max 25, 0.17% of
   subpixels over 8 — invisible through `mix-blend-lighten` at 20–34% scale.
2. **A hydration mismatch threw the hydrated tree away on every load.**
   `MastheadSg` read `customElements` in its initial state, so when the SGDS
   import won the race against hydration the client rendered
   `<sgds-masthead>` where the server had written the fallback markup (React
   #418, the one console error on the page). The upgrade now happens in the
   effect that was already there. Confirmed in a real browser: no console
   exceptions, `sgds-masthead` present after load, `--masthead-h` still set.

## Screenshots

- `1280-hero-cloud-avif.png`, `360-hero-cloud-avif.png` — the hero with the
  AVIF clouds, for comparison against `1280-hero.png` / `360-hero.png` from
  the round-3 set.

## Remaining performance findings, not fixed

- **224KB of unused JavaScript**, of which the homepage's modulepreload list
  includes `content-review-page` and `cms-public-page` chunks it never
  renders. Route-level code splitting, not a page problem — worth a look
  before the next round.
- **The hero video is 1.9MB and loads on every motion-allowed visit**,
  mobile included, after hydration. It no longer holds LCP (3.40s mobile) and
  TBT stays 0, so it is within budget; deferring it until the figure is near
  the viewport would still save most of that on mobile, where it starts below
  the fold.
- **`total-byte-weight` still scores 0.5** — 2.38MB, dominated by that video.
