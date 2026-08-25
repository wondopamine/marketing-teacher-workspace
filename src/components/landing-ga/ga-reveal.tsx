import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useEffect, useRef, useState } from "react"

import { GaRevealScatter } from "./ga-reveal-scatter"

import type { MotionValue } from "motion/react"
import type { ReactNode } from "react"

import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import { gaPageCopy } from "@/content/landing-ga-page"

const DESKTOP_QUERY = "(min-width: 1024px)"

/**
 * The scatter needs room the statement does not. Below 1280, five ~300px
 * fragments cannot sit both clear of a centred statement and inside the
 * viewport — the arithmetic has no solution, and scaling them inward put the
 * page's brand sentence underneath the decoration (design review, 2026-08-24).
 * So the fragments are a ≥1280 enhancement; a narrower desktop keeps the beats
 * on the bare ground, which is the composition without its decoration rather
 * than a broken one.
 */
const SCATTER_QUERY = "(min-width: 1280px)"

/**
 * The two beats, as fractions of the section's travel.
 *
 * The section runs two viewports over a pinned stage, so `0.5` is the moment
 * the pin starts and `1` the moment it ends. Beat one holds through the first
 * half and beat two through the second, with the swap in between — so stopping
 * anywhere but mid-swap leaves a sentence settled and readable.
 */
const BEATS = {
  /** In, hold, then up and out. */
  first: {
    opacity: { at: [0, 0.18, 0.34, 0.6, 0.72, 1], to: [0, 0, 1, 1, 0, 0] },
    y: { at: [0.18, 0.34, 0.6, 0.72], to: [26, 0, 0, -44] },
  },
  /** Rises from below into the space the first beat vacated, then holds. */
  second: {
    opacity: { at: [0, 0.66, 0.82, 1], to: [0, 0, 1, 1] },
    y: { at: [0.66, 0.82], to: [34, 0] },
  },
} as const

type BeatSpec = {
  opacity: { at: ReadonlyArray<number>; to: ReadonlyArray<number> }
  y: { at: ReadonlyArray<number>; to: ReadonlyArray<number> }
}

function Beat({
  children,
  progress,
  spec,
}: {
  children: ReactNode
  progress: MotionValue<number>
  spec: BeatSpec
}) {
  // Spread: `useTransform`'s range overload takes mutable `number[]`.
  // `clamp: false` keeps motion 12 from lifting a scroll-linked opacity onto
  // its accelerated WAAPI path, where it would run as an independent animation
  // and ignore `scrollYProgress` entirely (same fix, same reason as
  // `paper-backdrop.tsx`). Safe because every opacity range spans [0, 1], so
  // nothing ever extrapolates.
  const opacity = useTransform(
    progress,
    [...spec.opacity.at],
    [...spec.opacity.to],
    { clamp: false }
  )
  const y = useTransform(progress, [...spec.y.at], [...spec.y.to])
  return (
    <motion.div
      className="col-start-1 row-start-1 will-change-[opacity,transform]"
      style={{ opacity, y }}
    >
      {children}
    </motion.div>
  )
}

/**
 * The reveal: the page's one statement, disclosed a sentence at a time.
 *
 * The headline's two sentences are the two beats — "the care was always yours",
 * then "we removed the admin between the moments" — and nothing else renders
 * here (product owner, 2026-08-24). On desktop they swap in place as the
 * section scrolls, over a pinned stage two viewports tall, while fragments of
 * the product and of the hero's paper world drift out from behind them
 * (`ga-reveal-scatter.tsx`, ≥1280 only).
 *
 * Below 1024px there is no pin and no stacking — the sentences are two
 * paragraphs in document order (CLAUDE.md's static mobile fallback). Under
 * `prefers-reduced-motion` that same flowing composition is used at every
 * width, `styles.css` unpins the stage, and the fragments are not drawn at all.
 * Transform and opacity only; the section clips horizontally so it can never
 * widen the page.
 */
export function GaReveal() {
  const reveal = gaPageCopy.reveal
  // === true: hydration null must not skip the fallback presentation
  const reduced = useReducedMotion() === true
  const [desktop, setDesktop] = useState(false)
  const [wideEnoughForScatter, setWideEnoughForScatter] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  // Tracked on the section, never on the pinned stage: a sticky element's own
  // box stops moving mid-pin, which would flatten the progress it reports.
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end end"],
    target: sectionRef,
  })

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_QUERY)
    const scatterQuery = window.matchMedia(SCATTER_QUERY)
    const update = () => {
      setDesktop(desktopQuery.matches)
      setWideEnoughForScatter(scatterQuery.matches)
    }
    update()
    desktopQuery.addEventListener("change", update)
    scatterQuery.addEventListener("change", update)
    return () => {
      desktopQuery.removeEventListener("change", update)
      scatterQuery.removeEventListener("change", update)
    }
  }, [])

  const [firstSentence, ...restSentences] = reveal.headlineBeats
  const secondSentence = restSentences.join(" ")
  const sentenceClass =
    "mx-auto max-w-[15ch] font-heading text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.05] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"

  // The `h2` carrying this section's `aria-labelledby` target must exist at
  // every scroll position, so the first sentence is always the heading and
  // never unmounts. `splitSentences` guarantees that first element; a
  // one-sentence headline simply has no second beat.
  const firstBeat = (
    <h2 className={sentenceClass} id="ga-reveal-title">
      {firstSentence}
    </h2>
  )
  const secondBeat =
    secondSentence.length === 0 ? null : (
      <p className={sentenceClass}>{secondSentence}</p>
    )

  const choreographed = desktop && !reduced && secondBeat !== null

  const statement = choreographed ? (
    // Both beats occupy one grid cell, so the second lands exactly where the
    // first left and the stage never changes height between them.
    <div className="relative mx-auto grid w-full max-w-3xl">
      <Beat progress={scrollYProgress} spec={BEATS.first}>
        {firstBeat}
      </Beat>
      <Beat progress={scrollYProgress} spec={BEATS.second}>
        {secondBeat}
      </Beat>
    </div>
  ) : (
    <RevealOnScroll>
      <div className="relative mx-auto w-full max-w-3xl">
        {firstBeat}
        {secondBeat === null ? null : <div className="mt-4">{secondBeat}</div>}
      </div>
    </RevealOnScroll>
  )

  return (
    <section
      aria-labelledby="ga-reveal-title"
      className="ga-reveal overflow-x-clip px-5 py-16 sm:px-8 lg:px-0 lg:py-0"
      ref={sectionRef}
    >
      <div className="ga-reveal-stage relative mx-auto flex w-full max-w-[1412px] items-center justify-center px-6 text-center sm:px-12 lg:sticky lg:top-0 lg:h-svh">
        {/* Gated on `choreographed`, not merely on width: unpinned (reduced
            motion) the stage is no longer a containing block, so an absolute
            layer would escape to the document and land over other sections.
            The fragments are decoration, so not drawing them costs nothing. */}
        {choreographed && wideEnoughForScatter ? (
          <GaRevealScatter progress={scrollYProgress} />
        ) : null}

        {statement}
      </div>

      {/* The second viewport of travel the swap scrolls through. It only earns
          its place when there is a second sentence to swap to. */}
      {choreographed ? (
        <div aria-hidden className="ga-reveal-rest hidden lg:block lg:h-svh" />
      ) : null}
    </section>
  )
}
