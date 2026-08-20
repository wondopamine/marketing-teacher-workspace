import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { TEACHER_WORKSPACE_APP_URL } from "@/content/landing"
import { gaJourneyActs, gaPageCopy } from "@/content/landing-ga-page"

const EASE = [0.4, 0, 0.2, 1] as const

// The approved product peek entering at the fold (ticket #7 candidate,
// recorded as proposed): the same student profile the journey opens on, so
// the hero's screen and the pinned journey frame read as one shared surface.
const peek = gaJourneyActs.find((act) => act.id === "notice")?.screen

export function GaHero() {
  const hero = gaPageCopy.hero
  // === true: hydration null must not skip the animation
  const reduced = useReducedMotion() === true

  return (
    <section
      aria-labelledby="ga-hero-title"
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* Illustrated paper sky — the locked v1 hero world, unchanged. */}
      <div aria-hidden className="hero-sky-bg absolute inset-0 overflow-hidden">
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[4%] left-[74%] w-[20%] mix-blend-lighten select-none"
          src="/hero/cloud-halftone.png"
        />
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[20%] -left-[6%] w-[34%] mix-blend-lighten select-none"
          src="/hero/cloud-halftone.png"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1024px] flex-1 flex-col items-center px-5 pt-40 text-center sm:px-8 sm:pt-44">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          transition={reduced ? { duration: 0 } : { duration: 0.2, ease: EASE }}
        >
          <h1
            className="font-heading text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
            id="ga-hero-title"
          >
            {hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-base leading-[1.7] text-balance text-[color:var(--paper-muted)] sm:text-lg">
            {hero.body}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              asChild
              className="h-12 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[var(--paper-shadow-cta)] transition-[background-color,translate,scale,box-shadow] duration-200 ease-out hover:-translate-y-px hover:bg-primary/90 hover:shadow-[var(--paper-shadow-cta-hover)] active:scale-[0.96]"
            >
              <a href={TEACHER_WORKSPACE_APP_URL} rel="noreferrer">
                {hero.action}
              </a>
            </Button>
            <p className="text-sm leading-5 text-[color:var(--paper-muted)]">
              {hero.actionNote}
            </p>
          </div>
          {gaPageCopy.reveal.launchLine === null ? null : (
            <p className="mt-6 inline-block rounded-full border border-dashed border-[color:var(--paper-rule-strong)] px-4 py-1.5 text-sm leading-5 text-[color:var(--paper-muted)]">
              {gaPageCopy.reveal.launchLine}
            </p>
          )}
        </motion.div>

        {/* The product peek rising at the fold. Decorative: the journey's
            copy carries every claim this screen could make. */}
        {peek === undefined ? null : (
          <motion.figure
            animate={{ opacity: 1, y: 0 }}
            aria-label={`A peek at Teacher Workspace: ${peek.depicts}`}
            className="mt-14 -mb-10 w-full max-w-[820px] rounded-t-xl border border-b-0 border-[color:var(--paper-rule-strong)] bg-[color:var(--paper-card)] p-3 pb-0 shadow-[var(--paper-shadow-peek)] sm:mt-16"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            role="img"
            transition={
              reduced ? { duration: 0 } : { duration: 0.3, ease: EASE }
            }
          >
            <img
              alt=""
              aria-hidden
              className="w-full rounded-t-lg select-none"
              height={peek.height}
              src={peek.src}
              width={peek.width}
            />
          </motion.figure>
        )}
      </div>
    </section>
  )
}
