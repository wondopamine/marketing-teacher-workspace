import { MemoCard } from "@/components/landing/memo-card"
import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import {
  gaPageCopy,
  gaSectionAnchors,
  gaTestimonials,
} from "@/content/landing-ga-page"

const TAPES = [1, 2, 3] as const

/**
 * Section 6 of the IA: testimonial notes in the v1 memo format. Verbatim
 * staff quotes, role and school level only, scoped to Posts — the capability
 * the verbatims actually evidence (ADR 0003).
 */
export function GaSchools() {
  return (
    <section
      aria-labelledby="ga-schools-title"
      className="scroll-mt-28 px-5 pb-20 sm:px-8 lg:pb-16"
      id={gaSectionAnchors.schools}
    >
      <div className="mx-auto flex w-full max-w-[1412px] flex-col justify-center rounded-[28px] bg-[color:var(--memo-section-bg)] px-6 py-14 sm:rounded-[44px] sm:px-12 sm:py-24 lg:min-h-[calc(100svh-4rem)] lg:px-24 lg:py-20">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="font-heading text-[clamp(1.75rem,4vw,3.5rem)] leading-[1.08] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
              id="ga-schools-title"
            >
              {gaPageCopy.schools.heading}
            </h2>
            <p className="mt-6 font-body text-base leading-[1.7] text-balance text-[color:var(--paper-ink)]/75 sm:text-lg">
              {gaPageCopy.schools.lede}
            </p>
          </div>
        </RevealOnScroll>

        <div className="mx-auto mt-14 grid w-full max-w-[1220px] grid-cols-1 gap-10 [perspective:900px] sm:gap-7 lg:mt-20 lg:grid-cols-3">
          {gaTestimonials.map((testimonial, index) => (
            <MemoCard
              index={index}
              key={testimonial.id}
              memo={{
                number: String(index + 1).padStart(2, "0"),
                tape: TAPES[index % TAPES.length] ?? 1,
                quote: `“${testimonial.quote}”`,
                role: testimonial.role,
                school: testimonial.schoolLevel,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
