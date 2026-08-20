import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import {
  gaAudiences,
  gaPageCopy,
  gaSectionAnchors,
} from "@/content/landing-ga-page"

import type { GaAudienceId } from "@/content/landing-ga-page"

// Tinted paper sheets — the v1 audience grammar (audience-columns.tsx), not
// card chrome: no border, no shadow, nothing interactive implied (SLP-11
// rationale recorded in docs/decisions/ga-landing-page.md).
const AUDIENCE_BG: Record<GaAudienceId, string> = {
  teachers: "var(--audience-cream)",
  "key-personnel": "var(--audience-mint)",
  "school-leaders": "var(--audience-sky)",
}

/**
 * Section 5 of the IA: three short blocks — teachers, KPs, school leaders —
 * each answering its audience's real question.
 */
export function GaAudiences() {
  return (
    <section
      aria-labelledby="ga-audiences-title"
      className="scroll-mt-28 px-5 pb-20 sm:px-8 lg:pb-28"
      id={gaSectionAnchors.audiences}
    >
      <div className="mx-auto w-full max-w-[1220px]">
        <RevealOnScroll>
          <h2
            className="text-center font-heading text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.12] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
            id="ga-audiences-title"
          >
            {gaPageCopy.audiences.heading}
          </h2>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-16">
          {gaAudiences.map((audience) =>
            audience.question === null || audience.answer === null ? null : (
              <div
                className="rounded-xl p-7"
                key={audience.id}
                style={{ backgroundColor: AUDIENCE_BG[audience.id] }}
              >
                <p className="text-sm leading-5 font-semibold text-[color:var(--paper-ink)]/70">
                  {audience.label}
                </p>
                <h3 className="mt-3 font-heading text-xl leading-[1.3] font-semibold text-balance text-[color:var(--paper-ink)]">
                  “{audience.question}”
                </h3>
                <p className="mt-3 font-body text-base leading-[1.65] text-[color:var(--paper-ink)]/80">
                  {audience.answer}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
