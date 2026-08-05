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

The current public landing page remains at `/`. A PM-facing Landing V2
wireframe is available directly at `/content-review`; it is intentionally
unlinked, greyscale, static, unauthenticated, and marked `noindex, nofollow`.
It presents the actual canonical public-safe draft copy in a landing-page flow,
keeps unresolved content explicit, and contains no live CTAs, product
interaction, or media. It is a communication artifact, not publication
approval, a final visual direction, or access control.

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
- `src/content/landing.ts` is the current rendered content.
- `src/content/landing-v2.ts` is the typed issue #3 content contract.
- `src/content/landing-v2-readiness.ts` exposes structural errors and unresolved
  launch decisions separately.
- `src/content/landing-v2-review.server.ts` owns the server-only ordered review
  registry and public-copy projection.
- `src/content/landing-v2-review-state.server.ts` binds review state to item,
  IA-order, and composed-story snapshots, composes server-side review
  readiness, then projects a minimal wireframe DTO with references, snapshots,
  and unused destinations removed.
- `src/components/content-review/` renders the share-safe, greyscale, static
  landing-page wireframe for PM review; its presentation is disposable and is
  not a final visual direction.
- `src/server/content-review.ts` is the only route-facing RPC boundary and
  returns only the minimal wireframe DTO.
- `src/config/site.ts` centralises product, feedback, support, and source links.
- `docs/landing-page-v2-foundations.md` explains the v2 handoff and why no
  backend or analytics integration exists without a product/governance
  contract.
