# Teacher Workspace

TanStack Start marketing site for Teacher Workspace.

## Runtime

- Node.js 24 LTS (`.nvmrc`)
- pnpm 10 (`packageManager` in `package.json`)

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The local site runs at `http://127.0.0.1:3000/`.

## Editing the copy

PMs and reviewers edit all landing-page and wireframe wording in `content/` as
MDX. See [`content/README.md`](content/README.md) for the editing guide.
`src/content/landing-v2.ts` defines the sections, their order, and the product
capability behind each story step. This keeps wording edits from changing the
product contract.

The public landing page is at `/`. The PM-facing Landing V2 wireframe is at
`/content-review`. It is unlinked, greyscale, static, unauthenticated, and marked
`noindex, nofollow`. It shows the canonical public-safe draft copy in landing
page order and marks unresolved content. The wireframe has no live CTA, product
interaction, or media. It helps reviewers discuss the page but does not grant
publication approval, set the final visual direction, or control access.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm build` also scans the generated public assets for known review-data
leaks, then requests `/content-review` and `/` through the built TanStack Start
handler to verify the draft metadata, public-safe output, and homepage
isolation. The same core checks run in `.github/workflows/ci.yml`.

## Project shape

- `src/routes/` owns SSR document metadata, the public landing route, and the
  isolated content-review route.
- `src/components/landing/scroll-choreography/` owns the desktop pinned
  experience and its static mobile/reduced-motion fallback.
- `content/` holds every PM-editable word as MDX, compiled to plain data at
  build time by the Vite plugin in `src/content/mdx-plugin.ts`. No markdown
  parser reaches the browser or the server runtime.
- `src/content/mdx-parse.ts` parses one `.mdx` file; `src/content/mdx-document.ts`
  reads the result and raises errors naming the file and the missing field.
- `src/content/landing-copy.ts` loads `content/` and exposes it to the server.
- `src/content/landing.ts` is the current rendered content.
- `src/content/landing-v2.ts` is the typed issue #3 content contract; it owns
  structure and takes its words from `content/`.
- `src/content/landing-v2-readiness.ts` exposes structural errors and unresolved
  launch decisions separately.
- `src/content/landing-v2-review.server.ts` owns the server-only ordered review
  registry and public-copy projection.
- `src/content/landing-v2-review-state.server.ts` binds review state to item,
  IA-order, and composed-story snapshots, composes server-side review
  readiness, then projects a minimal wireframe DTO with references, snapshots,
  and unused destinations removed.
- `src/components/content-review/` renders the public-safe, greyscale, static
  landing-page wireframe for PM review. Its temporary styling does not set the
  final visual direction. `content-review-chrome.ts` keeps the route's labels
  and proposed-screen briefs out of the review registry, snapshots, and server
  DTO.
- `src/server/content-review.ts` is the only route-facing RPC boundary and
  returns only the minimal wireframe DTO.
- `src/config/site.ts` centralises product, feedback, support, and source links.
- `docs/landing-page-v2-foundations.md` explains the v2 handoff and why no
  backend or analytics integration exists without a product/governance
  contract.
