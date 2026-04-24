# Teacher Workspace

A private TanStack Start landing page project for Teacher Workspace.

## Stack

- TanStack Start + React
- TypeScript
- Tailwind CSS v4
- shadcn/ui with Radix primitives
- Radix Colors for theme tokens
- Motion for the scroll-linked hero sequence

## Scripts

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

The local app runs at `http://127.0.0.1:3000/` by default.

## Project Shape

- `src/routes/index.tsx` composes the landing page.
- `src/components/landing/` contains the cinematic hero and page sections.
- `src/content/landing.ts` holds the editable landing copy.
- `src/styles.css` contains Tailwind, shadcn tokens, Radix color mapping, and the hero placeholder styling.

The hero currently uses local visual placeholders that mirror the eventual media contract: poster/start layer, scrub layer, end-frame layer, and product UI handoff. Later, those placeholder layers can be replaced with original poster images and MP4/WebM sources without changing the scroll timing model. The Mercury screenshots in the plan are reference material for pacing and composition only.
