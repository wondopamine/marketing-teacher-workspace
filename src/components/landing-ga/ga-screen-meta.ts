import type { GaJourneyActId } from "@/content/landing-ga-page"

/**
 * What the journey needs to know about its screens without loading them.
 *
 * The screens themselves (`ga-screens.tsx` and the `ga-screen-*` files) are
 * one lazily-loaded chunk: server-rendered, the five of them pushed the
 * document from 11.7KB to 15.6KB compressed — past TCP's first congestion
 * window — and cost Lighthouse mobile four points for an illustration nobody
 * has scrolled to yet. So the server sends each act's words, the sr-only
 * description of its demonstration and its caption from here, with an empty
 * stage, and the chunk arrives when an act comes within a viewport of the
 * fold. This module must stay free of imports from the screens.
 */

export type ActScreenMeta = {
  /** What the demonstration shows, for readers who do not see it. */
  readonly description: string
  /** A visible line under the stage, when the screen needs one. */
  readonly caption?: string
}

export const gaActScreenMeta: Record<GaJourneyActId, ActScreenMeta> = {
  promise: {
    description:
      "A demonstration: the class list of fourteen students narrows as filters are added — attendance under 60%, then no recorded social links — until three remain.",
  },
  notice: {
    description:
      "A demonstration: one student's profile, with its attendance, wellbeing and academic sections reached from a jump-to rail. Behaviour and family details are not shown.",
    caption: "Sensitive sections stay inside the profile.",
  },
  "next-steps": {
    description:
      "A demonstration: beside the profile, a suggested next step arrives — keep the daily check-in going — with the reasoning, who to contact and what to read. The decision stays with the teacher.",
  },
  words: {
    description:
      "A demonstration: a template is chosen — Term Update Letter — and a first draft of the post arrives in the composer, with the note that it is for the teacher to review and edit before posting.",
  },
  "family-and-record": {
    description:
      "A demonstration: the overview of a posted update — two of three families have read it, one has not, and a reminder is scheduled for them.",
  },
}

/**
 * The natural size of each act's one component — the thing the reveal's card
 * turns over to show, measured as authored rather than guessed.
 *
 * The card takes its proportion *and* its size from these (owner, 2026-08-26:
 * "UIs should be priority when it comes to the proportion and size of the card.
 * Then photograph can fit to that aspect ratio"). The scatter scales the width
 * to the card's, derives the card's height from the ratio here, and the
 * photograph on the front crops to whatever shape that makes. Sizing the card
 * first and fitting the component into it is what left a quarter of the
 * delivery overview's card empty under the component.
 *
 * The height is the height the component lays out to at its own width, taken
 * from the running page. The scatter still measures the real thing and corrects
 * itself, because a font landing late changes it — but a card that has to wait
 * for a measurement to know its shape would re-crop its photograph in front of
 * the reader when the screens' chunk arrives.
 */
export const STILL_SIZE: Record<
  GaJourneyActId,
  { readonly width: number; readonly height: number }
> = {
  promise: { width: 460, height: 474 },
  notice: { width: 236, height: 300 },
  "next-steps": { width: 520, height: 286 },
  words: { width: 480, height: 362 },
  "family-and-record": { width: 440, height: 211 },
}
