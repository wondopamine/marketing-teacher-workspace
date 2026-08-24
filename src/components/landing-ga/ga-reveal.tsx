import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import { gaPageCopy } from "@/content/landing-ga-page"

/**
 * The reveal: name the product once, state the thesis, land the
 * launch line. The only sky-blue band above the proof section, so the two
 * brand moments bookend the discovery layer.
 */
export function GaReveal() {
  const reveal = gaPageCopy.reveal
  return (
    <section
      aria-labelledby="ga-reveal-title"
      className="px-5 py-10 sm:px-8"
    >
      <div className="mx-auto w-full max-w-[1412px] rounded-[28px] bg-[color:var(--memo-section-bg)] px-6 py-20 text-center sm:rounded-[44px] sm:px-12 sm:py-28">
        <RevealOnScroll>
          <p className="text-sm leading-5 font-semibold text-[color:var(--cta-ground)]">
            {reveal.eyebrow}
          </p>
          <h2
            className="mx-auto mt-4 max-w-[22ch] font-heading text-[clamp(1.875rem,4vw,3rem)] leading-[1.1] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
            id="ga-reveal-title"
          >
            {reveal.headline}
          </h2>
          <p className="mx-auto mt-6 max-w-[46ch] font-body text-base leading-[1.7] text-balance text-[color:var(--paper-ink)]/80 sm:text-lg">
            {reveal.body}
          </p>
          {reveal.launchLine === null ? null : (
            <p className="mt-8 text-sm leading-5 text-[color:var(--cta-ground)]">
              {reveal.launchLine}
            </p>
          )}
        </RevealOnScroll>
      </div>
    </section>
  )
}
