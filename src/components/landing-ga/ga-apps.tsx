import { PenLineIcon, SendIcon, SparklesIcon, UserSearchIcon } from "lucide-react"

import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import {
  gaCapabilities,
  gaPageCopy,
  gaSectionAnchors,
} from "@/content/landing-ga-page"

import type { LucideIcon } from "lucide-react"

const capabilityIcons: Record<string, LucideIcon> = {
  "student-insights": UserSearchIcon,
  "next-step": SparklesIcon,
  "message-drafting": PenLineIcon,
  posts: SendIcon,
}

/**
 * Section 4 of the IA, simplified per stakeholder feedback (2026-08-21):
 * one icon, one title, one line per capability — no card chrome, no
 * scenarios. Each item still anchors back into the journey act where the
 * capability is shown, so discovery stays one hop away. The scenario copy
 * remains in `05-capabilities.mdx` for the wireframe; it just no longer
 * renders here.
 */
export function GaApps() {
  return (
    <section
      aria-labelledby="ga-apps-title"
      className="scroll-mt-28 px-5 py-20 sm:px-8 lg:py-28"
      id={gaSectionAnchors.apps}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <RevealOnScroll>
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <img
              alt=""
              aria-hidden
              className="size-12 rounded-xl shadow-[var(--paper-shadow-card)] select-none"
              height={48}
              src="/hero/tw-icon.png"
              width={48}
            />
            <h2
              className="mt-6 font-heading text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.12] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
              id="ga-apps-title"
            >
              {gaPageCopy.apps.heading}
            </h2>
            <p className="mt-5 font-body text-base leading-[1.7] text-balance text-[color:var(--paper-muted)]">
              {gaPageCopy.apps.lede}
            </p>
          </div>
        </RevealOnScroll>

        <ul className="mt-12 grid list-none grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {gaCapabilities.map((capability) => {
            const Icon = capabilityIcons[capability.copyId] ?? SparklesIcon
            return (
              <li className="flex" key={capability.copyId}>
                <a
                  className="group flex flex-1 flex-col items-center rounded-xl px-3 py-2 text-center transition-colors duration-200 ease-out hover:bg-[color:var(--paper-hover-bg)] focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none"
                  href={`#${capability.actAnchor}`}
                >
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-full bg-[color:var(--audience-sky)] text-[color:var(--cta-blue)] transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                  >
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 font-heading text-xl leading-7 font-semibold text-[color:var(--paper-ink)]">
                    {capability.publicLabel}
                  </h3>
                  <p className="mt-2 flex-1 font-body text-sm leading-[1.6] text-[color:var(--paper-muted)]">
                    {capability.job}
                  </p>
                  <span className="mt-3 text-sm leading-5 font-semibold text-[color:var(--cta-blue)]">
                    See it in the journey <span aria-hidden>→</span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
