## Project

**Teacher Workspace — Marketing Landing**

Marketing landing page for Teacher Workspace, a school product that gives teachers one screen to see every student's full picture (attendance, behavior, notes, messages home). The current conversion target is `https://teacher.digital.moe.gov.sg`, which is available only on MOE-issued devices.

**Core Value:** A single scroll-driven choreography that introduces the product UI as a shared element morphing through the page — emerging from the hand-drawn paper world, scaling to a full reveal, then docking to the side as features explain themselves. If everything else regresses, *this transition must feel intentional and on-brand*.

### Constraints

- **Tech stack**: React 19 + TanStack Start + Tailwind v4 + `motion/react` — locked. The choreography must be implementable inside this stack without introducing GSAP or another animation library.
- **Visual system**: Paper design tokens (`--paper-*`) and the existing illustration assets in `/public/hero/` are locked. Don't restyle the illustration.
- **Performance**: Must not regress current Lighthouse scores. Scroll choreography is GPU-friendly (transform/opacity only); no layout thrash.
- **Accessibility**: `prefers-reduced-motion` is a hard requirement. All content must be reachable without scroll-driven animation.
- **Mobile**: Static fallback only — no engineering effort spent on mobile pinned scroll.
- **Deployment**: Vercel; the live app at `https://teacher.digital.moe.gov.sg` is the conversion target and must not be modified by this milestone.
- **Scope discipline**: Marketing-site-only milestone. Live app is untouched.

## Agent skills

### Issue tracker

GitHub issues in `String-dxd/marketing-teacher-workspace`. `origin` is a fork with issues disabled, so every `gh` command needs an explicit `--repo`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default roles, each label string equal to its name. Only `wontfix` exists upstream today. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. Also read `docs/decisions/` for binding design decision records. See `docs/agents/domain.md`.
