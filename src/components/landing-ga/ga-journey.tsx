import { useInView, useReducedMotion } from "motion/react"
import { Suspense, lazy, useEffect, useRef, useState } from "react"

import { gaActScreenMeta } from "./ga-screen-meta"

import type { GaJourneyAct } from "@/content/landing-ga-page"
import type { ReactNode } from "react"

import { gaJourneyActs, gaSectionAnchors } from "@/content/landing-ga-page"

const DESKTOP_QUERY = "(min-width: 1024px)"

/**
 * The screens are one chunk, and it is not in the document: server-rendered
 * they pushed the HTML past TCP's first congestion window and cost Lighthouse
 * mobile four points (see `ga-screen-meta.ts`). The chunk arrives a viewport
 * before the journey does.
 */
const ActScreen = lazy(() =>
  import("./ga-screens").then((module) => ({ default: module.ActScreen }))
)

/** How early the screens mount: one viewport before they are needed. */
const MOUNT_MARGIN = "100% 0px 100% 0px"

// An act is the active one while it crosses the middle band of the viewport.
const ACT_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "-45% 0px -45% 0px",
}

/**
 * Acts 1–5 of the care journey: the act's copy on the left, and a coded
 * screen of the product on the right, bleeding off the page, performing a
 * scripted demonstration of the moment (owner, 2026-08-26, after paper.design
 * — decision record, "the journey becomes Paper-style screens").
 *
 * On desktop with motion allowed the stage is anchored: one sticky frame on
 * the right holds the screens, and as the copy scrolls past — one act per
 * view — the frame crossfades to the act in the middle of the viewport and
 * that act's script plays, twice, then rests (owner, 2026-08-26: the section
 * should anchor and show its contents on scroll, as the journey did before
 * this rebuild). Everywhere else — narrow viewports, reduced motion, the
 * server — the acts stack, each with its own stage at its settled frame, so
 * the composition is complete without the choreography.
 *
 * The screens are decorative: each act's copy carries the claim, and an
 * sr-only line says what the demonstration shows. No control lives inside a
 * screen. The server sends the words and the descriptions with empty stages;
 * the screens' chunk mounts when the journey is a viewport away.
 *
 * `overflow-x-clip` on the section is what lets a screen run off the right
 * edge without the page growing a horizontal scrollbar.
 */
export function GaJourney() {
  // === true: hydration null must not skip the stacked presentation
  const reduced = useReducedMotion() === true
  const [desktop, setDesktop] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef<HTMLElement | null>(null)
  const actsRef = useRef<HTMLDivElement | null>(null)
  const near = useInView(sectionRef, { margin: MOUNT_MARGIN, once: true })
  const anchored = desktop && !reduced

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const update = () => setDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!anchored) return
    const root = actsRef.current
    if (!root) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const index = Number(entry.target.getAttribute("data-act-index"))
        if (!Number.isNaN(index)) setActiveIndex(index)
      }
    }, ACT_OBSERVER_OPTIONS)
    for (const act of root.querySelectorAll("[data-act-index]")) {
      observer.observe(act)
    }
    return () => observer.disconnect()
  }, [anchored])

  return (
    <section
      aria-label="The journey"
      className="scroll-mt-28 overflow-x-clip py-16 lg:py-0"
      id={gaSectionAnchors.journey}
      ref={sectionRef}
    >
      <div
        className={
          anchored
            ? "mx-auto grid w-full max-w-[1220px] grid-cols-[minmax(320px,4fr)_minmax(0,8fr)] gap-x-10 px-5 sm:px-8"
            : "mx-auto flex w-full max-w-[1220px] flex-col gap-y-8 px-5 sm:px-8"
        }
      >
        <div className="flex flex-col" ref={actsRef}>
          {gaJourneyActs.map((act, index) => (
            <JourneyAct
              act={act}
              anchored={anchored}
              index={index}
              key={act.id}
              near={near}
            />
          ))}
        </div>

        {anchored ? (
          <div>
            {/* The anchored stage: a full-viewport sticky wrapper centres the
                frame, and the frame holds every screen stacked in place —
                only the active act's is visible and playing; the rest sit
                inert at their settled frame, so the swap is opacity alone. */}
            <div
              // The band the stage centres in starts under the fixed nav
              // (masthead + the cluster's own height and breathing room), or
              // at 1280×800 the list's header ran beneath "Get started".
              className="sticky top-0 flex h-svh flex-col justify-center pt-[calc(var(--masthead-h,0px)+6rem)] pb-8"
            >
              <StageBox>
                {near ? (
                  <div className="ga-fade-up absolute inset-0">
                    {gaJourneyActs.map((act, index) => {
                      const active = index === activeIndex
                      return (
                        <div
                          className={`${SCALED} transition-opacity duration-200 ease-in-out`}
                          inert={!active}
                          key={act.id}
                          style={{ opacity: active ? 1 : 0 }}
                        >
                          <Suspense fallback={null}>
                            <ActScreen active={active} id={act.id} />
                          </Suspense>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </StageBox>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

type JourneyActProps = {
  readonly act: GaJourneyAct
  readonly anchored: boolean
  readonly index: number
  readonly near: boolean
}

function JourneyAct({ act, anchored, index, near }: JourneyActProps) {
  const { description } = gaActScreenMeta[act.id]
  return (
    <article
      className={
        anchored
          ? "flex min-h-svh flex-col justify-center pt-[calc(var(--masthead-h,0px)+6rem)] pb-16"
          : "flex flex-col gap-y-8 py-8 lg:min-h-svh lg:justify-center lg:py-16"
      }
      data-act-index={index}
    >
      {/* The copy is the act; the screen beside or below it is illustration.
          The block's id sits here so the act is reachable by anchor, and so
          what the tests read as "the act" is its own words. */}
      <div className="scroll-mt-28" id={`act-${act.id}`}>
        <p className="text-sm leading-5 font-semibold text-[color:var(--paper-muted)]">
          {act.moment}
        </p>
        <h2 className="mt-3 font-heading text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.15] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]">
          {act.headline}
        </h2>
        <p className="mt-4 max-w-[46ch] font-body text-base leading-[1.7] text-[color:var(--paper-muted)]">
          {act.body}
        </p>
        <p className="sr-only">{description}</p>
      </div>

      {anchored ? null : (
        <div>
          {/* Stacked: the act's own stage, at the settled frame. Scripts do
              not play here — this is the phone, the reduced-motion reader,
              and the server. */}
          <StageBox>
            {near ? (
              <div className={`ga-fade-up ${SCALED}`}>
                <Suspense fallback={null}>
                  <ActScreen active={false} id={act.id} />
                </Suspense>
              </div>
            ) : null}
          </StageBox>
        </div>
      )}
    </article>
  )
}

/**
 * The composition is authored at the product's own size and drawn a little
 * smaller — transform only — so more of the list is in view at 1024–1440 and
 * a phone still sees the panel whole.
 */
const SCALED =
  "absolute inset-0 origin-top-left scale-[0.72] sm:scale-[0.85] lg:scale-[0.9]"

/**
 * The stage: a fixed-height box that clips at its foot and lets a screen run
 * out of its right side. `--screen-x` is where the background screen starts,
 * leaving the gutter for the foreground panel to sit over. The foot fades
 * into the page rather than cutting a row in half.
 */
function StageBox({ children }: { readonly children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative h-[440px] overflow-x-visible overflow-y-clip [--screen-x:clamp(200px,30%,320px)] sm:h-[520px] lg:h-[min(680px,calc(100svh-var(--masthead-h,0px)-8rem))]"
    >
      {children}
      <div className="pointer-events-none absolute right-[-50vw] bottom-0 left-0 h-32 bg-gradient-to-b from-transparent to-[color:var(--paper)]" />
    </div>
  )
}
