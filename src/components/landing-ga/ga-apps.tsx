import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import {
  gaCapabilities,
  gaPageCopy,
  gaSectionAnchors,
} from "@/content/landing-ga-page"

/**
 * Section 4 of the IA: the four capabilities up close, in journey order, for
 * the visitor who now wants specifics and for KPs who need briefing material.
 * The whole card is the link (SLP-11: cards are interactive units); each
 * card's scenario is distinct product evidence, not a repeated template.
 */
export function GaApps() {
  return (
    <section
      aria-labelledby="ga-apps-title"
      className="scroll-mt-28 px-5 py-20 sm:px-8 lg:py-28"
      id={gaSectionAnchors.apps}
    >
      <div className="mx-auto w-full max-w-[1220px]">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="font-heading text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.12] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
              id="ga-apps-title"
            >
              {gaPageCopy.apps.heading}
            </h2>
            <p className="mt-5 font-body text-base leading-[1.7] text-balance text-[color:var(--paper-muted)]">
              {gaPageCopy.apps.lede}
            </p>
          </div>
        </RevealOnScroll>

        <ul className="mt-12 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {gaCapabilities.map((capability, index) => (
            <li className="flex" key={capability.copyId}>
              <a
                className="group flex flex-1 flex-col rounded-xl border border-[color:var(--paper-rule)] bg-[color:var(--paper-card)] p-6 shadow-[var(--paper-shadow-card)] transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--paper-shadow-card-hover)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary"
                href={`#${capability.actAnchor}`}
              >
                <span className="font-body text-xs leading-4 font-medium text-[color:var(--paper-muted)] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-heading text-lg leading-6 font-semibold text-[color:var(--paper-ink)]">
                  {capability.publicLabel}
                </h3>
                <p className="mt-2 font-body text-sm leading-[1.6] font-medium text-[color:var(--paper-ink)]/85">
                  {capability.job}
                </p>
                <p className="mt-2 flex-1 font-body text-sm leading-[1.6] text-[color:var(--paper-muted)]">
                  {capability.scenario}
                </p>
                <span className="mt-5 text-sm leading-5 font-semibold text-primary transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                  See it in the journey <span aria-hidden>→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
