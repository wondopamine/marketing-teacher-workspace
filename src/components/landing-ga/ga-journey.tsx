import { useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"

import { gaActVignettes } from "./ga-vignettes"

import {
  gaJourneyActs,
  gaPageCopy,
  gaSectionAnchors,
} from "@/content/landing-ga-page"

import type { GaJourneyAct } from "@/content/landing-ga-page"

const DESKTOP_QUERY = "(min-width: 1024px)"

// The visible act drives the pinned frame: an act "activates" when it crosses
// the middle band of the viewport.
const ACT_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "-45% 0px -45% 0px",
}

/**
 * Acts 1–5 of the care journey, one capability excerpt per act. The excerpts
 * are coded feature vignettes (`ga-vignettes.tsx`), not product captures —
 * each shows only the key component of the capability, Linear-style, with the
 * active one allowed to move and (for the filter) be tried. On desktop with
 * motion allowed, one paper frame stays pinned while the acts scroll past and
 * the vignettes crossfade (opacity only — the GPU-friendly constraint).
 * Everywhere else — mobile, reduced motion, no JS — each act keeps its
 * vignette inline in its settled state, so the composition is complete
 * without the choreography.
 */
export function GaJourney() {
  // === true: hydration null must not skip the fallback presentation
  const reduced = useReducedMotion() === true
  const [enhanced, setEnhanced] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const actsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (reduced) {
      setEnhanced(false)
      return
    }
    const mq = window.matchMedia(DESKTOP_QUERY)
    const update = () => setEnhanced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [reduced])

  useEffect(() => {
    if (!enhanced) return
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
  }, [enhanced])

  return (
    <section
      aria-label="The journey"
      className="scroll-mt-28 px-5 py-20 sm:px-8 lg:py-28"
      id={gaSectionAnchors.journey}
    >
      <div
        className={
          enhanced
            ? "mx-auto grid w-full max-w-[1220px] gap-x-14 gap-y-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
            : "mx-auto flex w-full max-w-[720px] flex-col gap-y-16"
        }
      >
        <div
          className={enhanced ? "flex flex-col" : "flex flex-col gap-y-16"}
          ref={actsRef}
        >
          {gaJourneyActs.map((act, index) => (
            <JourneyActBlock
              act={act}
              enhanced={enhanced}
              index={index}
              key={act.id}
            />
          ))}
          {enhanced ? null : (
            <p className="mt-12 text-sm leading-5 text-[color:var(--paper-muted)] italic">
              {gaPageCopy.journey.syntheticNote}
            </p>
          )}
        </div>

        {enhanced ? (
          <div className="hidden lg:block">
            {/* No frame around the stage (SLP-4/SLP-11): the vignette card is
                the only chrome, floating on the paper ground while its
                states crossfade. */}
            <div className="sticky top-28">
              <div className="relative h-[min(560px,calc(100svh-13rem))]">
                {gaJourneyActs.map((act, index) => {
                  const Vignette = gaActVignettes[act.id]
                  const active = index === activeIndex
                  return (
                    <div
                      aria-hidden={!active}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out ${
                        active ? "opacity-100" : "pointer-events-none opacity-0"
                      }`}
                      inert={!active}
                      key={act.id}
                    >
                      <Vignette animate={active} />
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-center text-sm leading-5 text-[color:var(--paper-muted)] italic">
                {gaPageCopy.journey.syntheticNote}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

type JourneyActBlockProps = {
  readonly act: GaJourneyAct
  readonly index: number
  readonly enhanced: boolean
}

function JourneyActBlock({ act, index, enhanced }: JourneyActBlockProps) {
  const Vignette = gaActVignettes[act.id]
  return (
    <article
      className={
        enhanced
          ? "flex min-h-[75vh] flex-col justify-center py-10"
          : "flex flex-col"
      }
      data-act-index={index}
      style={{ scrollMarginTop: "7rem" }}
      id={`act-${act.id}`}
    >
      <p className="text-sm leading-5 font-semibold text-[color:var(--paper-muted)]">
        {act.moment}
      </p>
      <h2 className="mt-3 font-heading text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]">
        {act.headline}
      </h2>
      <p className="mt-4 max-w-[46ch] font-body text-base leading-[1.7] text-[color:var(--paper-muted)]">
        {act.body}
      </p>

      {enhanced ? null : (
        <div className="mt-6 flex justify-center">
          <Vignette animate={false} />
        </div>
      )}

      {act.capabilityLabel === null ? null : (
        <p className="mt-6 border-t border-[color:var(--paper-rule)] pt-4 text-sm leading-5 text-[color:var(--paper-muted)] italic">
          <strong className="font-semibold text-[color:var(--paper-ink)] not-italic">
            {act.capabilityLabel}
          </strong>
        </p>
      )}
    </article>
  )
}
