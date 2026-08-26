import {
  cubicBezier,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react"
import { useEffect, useRef, useState } from "react"

import { GaSchoolsMap } from "./ga-schools-map"
import { SG_MAP } from "./ga-singapore-map"

import type { MotionValue } from "motion/react"

import type { GaTestimonial } from "@/content/landing-ga-page"

import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import {
  gaPageCopy,
  gaSectionAnchors,
  gaTestimonials,
} from "@/content/landing-ga-page"
import { cn } from "@/lib/utils"

const DESKTOP_QUERY = "(min-width: 1024px)"

/**
 * A viewport of pinned scroll before the first card, so the map is seen as a
 * drawing in its own right before anything travels over it.
 */
const LEAD_IN = 1

/** Viewports of scroll the pin holds for: the lead-in, then one per card. */
const TRAVEL = LEAD_IN + gaTestimonials.length

/**
 * The moment the pin starts, as a fraction of the section's `start end → end
 * end` travel. The section is one viewport of stage plus `TRAVEL` viewports of
 * rest, and the stage sticks after exactly one viewport of scrolling.
 */
const PIN_START = 1 / (1 + TRAVEL)

/** …and the moment the first card arrives, once the lead-in is spent. */
const CARDS_START = PIN_START + (1 - PIN_START) * (LEAD_IN / TRAVEL)

/** How far a card lifts as it arrives and leaves, in px. Small on purpose. */
const CARD_LIFT = 26

const ENTER = cubicBezier(0.16, 1, 0.3, 1)

/**
 * When each card holds the middle of the map.
 *
 * The card does not travel: it sits at one place — centred over the map, under
 * the heading — and the three quotes take turns there (owner, 2026-08-25). An
 * earlier build ran the reference's conveyor, every card rising through the
 * middle and out of the top, and the quote was only settled for a moment in
 * passing. Holding the position means a reader who stops anywhere in a card's
 * slot finds it still, square, and readable.
 *
 * Each card gets one viewport. It arrives over the first quarter of that,
 * holds for half of it, and leaves over the last fifth — so the swap is brief
 * and the rest of the slot is rest. The last card has no exit; it holds until
 * the pin releases and the section scrolls away with it.
 */
function slotOf(index: number, count: number) {
  const slot = (1 - CARDS_START) / count
  const start = CARDS_START + index * slot
  return {
    start,
    settled: start + slot * 0.28,
    leaves: start + slot * 0.82,
    end: index === count - 1 ? null : start + slot,
  }
}

/**
 * One school's words, in the reference's card.
 *
 * The geometry starts from the reference's, read off the live page rather than
 * guessed: 24px of padding and a 24px gutter. The split does not: the
 * reference gives its picture half the card, and at our quote size that ran the
 * words to seven and eight lines, so the picture takes 42% and the words take
 * what is left (owner, 2026-08-25). The quote sits at the top of its column and the attribution at
 * the bottom (`justify-between`), which is what gives the card its air when a
 * quote runs short.
 *
 * The picture is square where the reference's is a 3:4 portrait: the drawings
 * are square, and a portrait card is tall enough to bury a wide, shallow
 * island. Each one is keyed by its testimonial's id — drop a replacement at
 * `assets/schools/<id>.png` and run `pnpm gen:school-art`.
 *
 * The type is ours, not the reference's: that page sets its quotes in a serif
 * and this design system has no serif (`--font-heading`, `--font-body` are
 * locked). What carries over is the proportion — a display-sized quote on tight
 * leading, a plain attribution line, and a small chip.
 */
function SchoolCard({
  className,
  testimonial,
}: {
  className?: string
  testimonial: GaTestimonial
}) {
  return (
    <figure
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-[color:var(--paper-rule)] bg-[color:var(--paper-card)] p-6 shadow-[var(--paper-shadow-card)] sm:flex-row",
        className
      )}
    >
      {/* Decorative, and below sm there is no room for it beside the words. */}
      <div className="hidden sm:block sm:w-[42%] sm:shrink-0">
        <picture>
          <source
            srcSet={`/schools/${testimonial.id}-320.avif 320w, /schools/${testimonial.id}-640.avif 640w`}
            type="image/avif"
          />
          <img
            alt=""
            aria-hidden
            className="block aspect-square w-full rounded-2xl bg-[color:var(--paper-hover-bg)] object-contain p-3 select-none"
            height={640}
            loading="lazy"
            sizes="(min-width: 1024px) 290px, 45vw"
            src={`/schools/${testimonial.id}-640.webp`}
            srcSet={`/schools/${testimonial.id}-320.webp 320w, /schools/${testimonial.id}-640.webp 640w`}
            width={640}
          />
        </picture>
      </div>

      <blockquote className="flex min-w-0 flex-1 flex-col justify-between gap-8">
        <p className="font-heading text-[1.375rem] leading-[1.24] font-medium tracking-[-0.015em] text-pretty text-[color:var(--paper-ink)] sm:text-[1.5rem]">
          {`“${testimonial.quote}”`}
        </p>
        {/* School level above the role (owner, 2026-08-26). The two used to sit
            at opposite ends of one row, which read as two unrelated labels
            pinned to the card's corners; stacked and left-aligned they read as
            one attribution, and the tag is the line that says which kind of
            school this is before you read who said it. */}
        <footer className="flex flex-col items-start gap-2">
          <p className="rounded-[4px] bg-[color:var(--paper-hover-bg)] px-2 py-1 font-body text-[12px] leading-4 whitespace-nowrap text-[color:var(--paper-muted)]">
            {testimonial.schoolLevel}
          </p>
          <p className="font-body text-sm leading-5 font-medium text-[color:var(--paper-ink)]">
            {testimonial.role}
          </p>
        </footer>
      </blockquote>
    </figure>
  )
}

/**
 * One testimonial taking its turn in the middle of the map: it lifts in,
 * holds still to be read, and lifts out as the next one arrives.
 */
function SchoolBeat({
  count,
  index,
  progress,
  testimonial,
}: {
  count: number
  index: number
  progress: MotionValue<number>
  testimonial: GaTestimonial
}) {
  const { start, settled, leaves, end } = slotOf(index, count)

  // A short lift in and out, never a traversal: the card's place on the page
  // is fixed and only the quote in it changes.
  const y = useTransform(
    progress,
    end === null ? [start, settled] : [start, settled, leaves, end],
    end === null ? [CARD_LIFT, 0] : [CARD_LIFT, 0, 0, -CARD_LIFT],
    { ease: ENTER }
  )
  const scale = useTransform(progress, [start, settled], [0.96, 1], {
    ease: ENTER,
  })
  // Spans the section's whole travel with `clamp: false`, so motion 12 cannot
  // lift this onto its accelerated WAAPI path — where a scroll-linked opacity
  // becomes an independent animation and stops reading `scrollYProgress`
  // (same fix, same reason, as `ga-reveal.tsx` and `paper-backdrop.tsx`).
  const opacity = useTransform(
    progress,
    end === null ? [0, start, settled, 1] : [0, start, settled, leaves, end, 1],
    end === null ? [0, 0, 1, 1] : [0, 0, 1, 1, 0, 0],
    { clamp: false }
  )

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform"
      style={{ y }}
    >
      <motion.div
        className="w-[min(46rem,72%)] will-change-[opacity,transform]"
        style={{ opacity, scale }}
      >
        <SchoolCard testimonial={testimonial} />
      </motion.div>
    </motion.div>
  )
}

/**
 * Section 6 of the IA: verbatim staff quotes, role and school level only,
 * scoped to Posts — the capability the verbatims actually evidence (ADR 0003).
 *
 * The illustrated rows are gone (owner, 2026-08-25). The section takes its
 * shape from the reference the owner supplied (lassie.ai's locations section),
 * read off the live page rather than the video: a heading and one line of lede
 * that stay put, a dot map beneath them, and one testimonial card centred over
 * it. The card's place is fixed — the quotes take turns in it rather than
 * travelling through, which is the one place this parts company with the
 * reference and the owner's call.
 *
 * Scroll is the only driver, and it drives transform and opacity only: `slotOf`
 * gives each quote a viewport, of which most is rest. The stage pins for five
 * viewports, one spent on the map alone before the first quote arrives, and it
 * clips, so nothing can leak into the sections either side.
 *
 * Below 1024px there is no pin: the map rests and the three cards are three
 * blocks in document order (CLAUDE.md's static mobile fallback). Under
 * `prefers-reduced-motion` that same flowing composition is used at every
 * width and the map's marks are never armed.
 */
export function GaSchools() {
  // === true: hydration null must not skip the fallback presentation
  const reduced = useReducedMotion() === true
  const [desktop, setDesktop] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  // Tracked on the section, never on the pinned stage: a sticky element's own
  // box stops moving mid-pin, which would flatten the progress it reports.
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end end"],
    target: sectionRef,
  })

  // The reference lets the map ride up into place while the section is still
  // scrolling — a slow parallax that finishes exactly as the pin engages, so
  // the drawing settles rather than simply arriving. The card layers are its
  // children, so they ride with it; no card is out during this stretch anyway.
  const mapY = useTransform(scrollYProgress, [0, PIN_START], [72, 0], {
    ease: ENTER,
  })

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const update = () => setDesktop(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  const choreographed = desktop && !reduced

  const header = (
    <div className="mx-auto max-w-2xl text-center">
      <h2
        className="font-heading text-[clamp(1.75rem,4vw,3.5rem)] leading-[1.08] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
        id="ga-schools-title"
      >
        {gaPageCopy.schools.heading}
      </h2>
      <p className="mt-5 font-body text-base leading-[1.7] text-balance text-[color:var(--paper-muted)] sm:text-lg">
        {gaPageCopy.schools.lede}
      </p>
    </div>
  )

  if (!choreographed) {
    return (
      <section
        aria-labelledby="ga-schools-title"
        className="scroll-mt-28 overflow-x-clip px-5 py-20 sm:px-8 lg:py-24"
        id={gaSectionAnchors.schools}
        ref={sectionRef}
      >
        <div className="mx-auto w-full max-w-[1120px]">
          <RevealOnScroll>{header}</RevealOnScroll>
          <RevealOnScroll>
            <GaSchoolsMap className="mx-auto mt-12 w-full" />
          </RevealOnScroll>
          <ul className="mt-12 grid list-none gap-6 sm:mt-16">
            {gaTestimonials.map((testimonial) => (
              <li key={testimonial.id}>
                <RevealOnScroll>
                  <SchoolCard testimonial={testimonial} />
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="ga-schools-title"
      className="ga-schools scroll-mt-28 overflow-x-clip"
      id={gaSectionAnchors.schools}
      ref={sectionRef}
    >
      <div className="ga-schools-stage sticky top-0 flex h-svh flex-col items-center justify-center gap-10 overflow-hidden px-8 pt-28 pb-10">
        {header}

        {/* The map sets this box's height, so the card layers below can be
            `inset-0` over exactly the drawing. Width is bounded by the
            viewport's remaining height through the map's own aspect ratio (the
            reserve covers the stage's padding, the header block and the gap),
            so the composition is always one screen and never scrolls. */}
        <motion.div
          className="relative w-full will-change-transform"
          style={{
            maxWidth: `min(1120px, calc((100svh - 21rem) * ${SG_MAP.aspect}))`,
            y: mapY,
          }}
        >
          <GaSchoolsMap />

          {gaTestimonials.map((testimonial, index) => (
            <SchoolBeat
              count={gaTestimonials.length}
              index={index}
              key={testimonial.id}
              progress={scrollYProgress}
              testimonial={testimonial}
            />
          ))}
        </motion.div>
      </div>

      {/* The travel the conveyor runs through: the lead-in, then the cards. */}
      <div
        aria-hidden
        className="ga-schools-rest"
        style={{ height: `${TRAVEL * 100}svh` }}
      />
    </section>
  )
}
