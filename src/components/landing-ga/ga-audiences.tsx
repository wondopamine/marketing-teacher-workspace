import { Accordion } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"

import type { GaAudienceId } from "@/content/landing-ga-page"

import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import {
  gaAudiences,
  gaPageCopy,
  gaSectionAnchors,
} from "@/content/landing-ga-page"

// The audience tint, kept from the v1 grammar but reduced to a role tag: the
// question is now the primary object, and the colour only says who asked it.
const AUDIENCE_TAG_BG: Record<GaAudienceId, string> = {
  teachers: "var(--audience-cream)",
  "key-personnel": "var(--audience-mint)",
  "school-leaders": "var(--audience-sky)",
}

/**
 * Section 5 of the IA: the questions schools actually ask, each tagged with
 * the role that asks it.
 *
 * Reframed from three tinted panels to an FAQ list (2026-08-24): the copy was
 * always a question and an answer, and three side-by-side panels made the
 * answers compete. A disclosure list lets a reader find their own role's
 * question first. Answers use `hiddenUntilFound`, so find-in-page and search
 * engines still reach the closed ones — the content is not gated on JS
 * interaction, only folded.
 *
 * On desktop the section reserves a full viewport with the list anchored at
 * the top, so an opening answer expands into the section's own whitespace and
 * the document height never changes — nothing below moves (measured off the
 * reference: lassie.ai holds constant docHeight through open/close). The
 * accordion is single-open (Base UI's default), which is what keeps the
 * worst-case expansion small enough for the reserved space to absorb. On
 * mobile the reservation is off and the list flows normally.
 */
export function GaAudiences() {
  const questions = gaAudiences.filter(
    (audience) => audience.question !== null && audience.answer !== null
  )

  return (
    <section
      aria-labelledby="ga-audiences-title"
      className="scroll-mt-28 px-5 pb-20 sm:px-8 lg:min-h-svh lg:pt-24 lg:pb-0"
      id={gaSectionAnchors.audiences}
    >
      <div className="mx-auto w-full max-w-[820px]">
        <RevealOnScroll>
          <h2
            className="text-center font-heading text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.12] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
            id="ga-audiences-title"
          >
            {gaPageCopy.audiences.heading}
          </h2>
        </RevealOnScroll>

        <Accordion.Root className="mt-10 flex flex-col gap-3 lg:mt-14">
          {questions.map((audience) => (
            <Accordion.Item
              className="rounded-2xl bg-[color:var(--paper-card)] ring-1 ring-[color:var(--paper-rule)] transition-shadow duration-200 ease-out data-[open]:shadow-[var(--paper-shadow-card)]"
              key={audience.id}
            >
              {/* Rendered as an explicit `h3`: the question is heading text, so
                  its tighter line-height belongs on a heading element rather
                  than on a span inside one (TYP-2). Base UI's own default here
                  is an h3 — naming it keeps that true in the source too. */}
              <Accordion.Header
                render={
                  <h3 className="m-0 font-heading text-lg leading-[1.35] font-semibold text-[color:var(--paper-ink)] sm:text-xl" />
                }
              >
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-5 rounded-2xl p-6 text-left focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none">
                  <span className="flex flex-col gap-2 sm:flex-row-reverse sm:items-center sm:justify-end sm:gap-4">
                    <span
                      className="w-fit rounded-full px-2.5 py-1 font-body text-xs leading-4 font-semibold text-[color:var(--paper-ink)]/75 sm:text-xs"
                      style={{
                        backgroundColor: AUDIENCE_TAG_BG[audience.id],
                      }}
                    >
                      {audience.label}
                    </span>
                    <span className="text-balance">{audience.question}</span>
                  </span>
                  <ChevronDownIcon
                    aria-hidden
                    className="size-5 shrink-0 text-[color:var(--paper-muted)] transition-transform duration-200 ease-out group-data-[panel-open]:rotate-180"
                    strokeWidth={1.8}
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel
                className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none"
                hiddenUntilFound
              >
                <p className="px-6 pb-6 font-body text-base leading-[1.65] text-[color:var(--paper-ink)]/80">
                  {audience.answer}
                </p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  )
}
