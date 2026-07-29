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

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The same checks run in `.github/workflows/ci.yml`.

## Project shape

- `src/routes/` owns SSR document metadata and the single landing route.
- `src/components/landing/scroll-choreography/` owns the desktop pinned
  experience and its static mobile/reduced-motion fallback.
- `src/content/landing.ts` is the current rendered content.
- `src/content/landing-v2.ts` is the typed issue #3 content contract.
- `src/content/landing-v2-readiness.ts` exposes structural errors and unresolved
  launch decisions separately.
- `src/config/site.ts` centralises product, feedback, support, and source links.
- `docs/landing-page-v2-foundations.md` explains the v2 handoff and why no
  backend or analytics integration exists without a product/governance
  contract.
