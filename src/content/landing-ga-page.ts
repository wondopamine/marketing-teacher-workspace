import metaSource from "/content/landing/01-meta.mdx"
import heroSource from "/content/landing/02-hero.mdx"
import storySource from "/content/landing/03-story.mdx"
import revealSource from "/content/landing/04-reveal.mdx"
import capabilitiesSource from "/content/landing/05-capabilities.mdx"
import audiencesSource from "/content/landing/07-audiences.mdx"
import proofSource from "/content/landing/08-proof.mdx"
import closeSource from "/content/landing/10-close.mdx"

import { MdxDocument, itemBody, itemHeading } from "./mdx-document"

/**
 * View-model for the GA landing page (issue #3's seven-section IA, direction
 * "One screen, carried" — see docs/decisions/ga-landing-page.md).
 *
 * This module is part of the PUBLIC bundle, so it imports only the public
 * copy files it renders — never `landing-copy.ts` (whose glob would pull the
 * wireframe and screen-catalog notes into the public output) and never
 * `landing-v2.ts` (whose governance dataset carries internal capability ids,
 * source URLs, and unpublished quotes). `landing-ga-page.test.ts` keeps this
 * module in sync with the governance source of truth at test time.
 */

const metaDocument = new MdxDocument(metaSource)
const heroDocument = new MdxDocument(heroSource)
const storyDocument = new MdxDocument(storySource)
const revealDocument = new MdxDocument(revealSource)
const capabilitiesDocument = new MdxDocument(capabilitiesSource)
const audiencesDocument = new MdxDocument(audiencesSource)
const proofDocument = new MdxDocument(proofSource)
const closeDocument = new MdxDocument(closeSource)

function itemCopy(document: MdxDocument, id: string) {
  const item = document.item(id)
  return {
    heading: itemHeading(document, item),
    body: itemBody(document, item),
    label: item.label,
  }
}

/** The story acts, in issue #3's care-journey order. */
export const gaJourneyActIds = [
  "promise",
  "notice",
  "next-steps",
  "words",
  "family-and-record",
] as const

export type GaJourneyActId = (typeof gaJourneyActIds)[number]

/** Public eyebrow line per act — issue #3's care-journey moments. */
const momentKeys = {
  promise: "momentPromise",
  notice: "momentNotice",
  "next-steps": "momentNextSteps",
  words: "momentWords",
  "family-and-record": "momentFamilyAndRecord",
} as const satisfies Record<GaJourneyActId, string>

/**
 * Round 3 (stakeholder feedback, 2026-08-21): the acts no longer render
 * product captures. Each act is illustrated by a coded feature vignette
 * (`ga-vignettes.tsx`) that shows only the key component of the capability —
 * information categories, filter criteria, read states — never a full product
 * screen, so Behaviour/Family details can never appear on the public page.
 */

/**
 * Which capability quietly closes each act, named by its copy block in
 * `05-capabilities.mdx` so the public label stays PM-editable there.
 */
const actCapabilityCopyIds = {
  promise: null,
  notice: "student-insights",
  "next-steps": "next-step",
  words: "message-drafting",
  "family-and-record": "posts",
} as const satisfies Record<GaJourneyActId, string | null>

export type GaJourneyAct = {
  readonly id: GaJourneyActId
  readonly moment: string
  readonly headline: string
  readonly body: string
  readonly capabilityLabel: string | null
}

export const gaJourneyActs: ReadonlyArray<GaJourneyAct> = gaJourneyActIds.map(
  (id) => {
    const copy = itemCopy(storyDocument, id)
    const capabilityCopyId = actCapabilityCopyIds[id]
    return {
      id,
      moment: storyDocument.text(momentKeys[id]),
      headline: copy.heading,
      body: copy.body,
      capabilityLabel:
        capabilityCopyId === null
          ? null
          : (capabilitiesDocument.item(capabilityCopyId).label ?? null),
    }
  }
)

export type GaCapability = {
  readonly copyId: string
  readonly publicLabel: string
  readonly job: string
  readonly scenario: string
  /** The journey act the card links back to — discovery after the story. */
  readonly actAnchor: string
}

const capabilityActAnchors = {
  "student-insights": "act-notice",
  "next-step": "act-next-steps",
  "message-drafting": "act-words",
  posts: "act-family-and-record",
} as const

export const gaCapabilities: ReadonlyArray<GaCapability> = (
  ["student-insights", "next-step", "message-drafting", "posts"] as const
).map((copyId) => {
  const copy = itemCopy(capabilitiesDocument, copyId)
  return {
    copyId,
    publicLabel: copy.label ?? copyId,
    job: copy.heading,
    scenario: copy.body,
    actAnchor: capabilityActAnchors[copyId],
  }
})

export const gaAudienceIds = [
  "teachers",
  "key-personnel",
  "school-leaders",
] as const

export type GaAudienceId = (typeof gaAudienceIds)[number]

export type GaAudience = {
  readonly id: GaAudienceId
  readonly label: string
  readonly question: string | null
  readonly answer: string | null
}

export const gaAudiences: ReadonlyArray<GaAudience> = gaAudienceIds.map(
  (id) => {
    const item = audiencesDocument.item(id)
    return {
      id,
      label: item.label ?? id,
      question: item.heading,
      answer: item.body.length === 0 ? null : item.body.join(" "),
    }
  }
)

export type GaTestimonial = {
  readonly id: string
  readonly quote: string
  readonly role: string
  readonly schoolLevel: string
}

/**
 * Proof stays scoped to what the verbatims evidence (Posts only — ADR 0003).
 * Three of the six staff quotes, curated 2026-08-20: speed of family reach,
 * immediacy, and workload reduction. The quotes naming "PG" stay unpublished
 * so another product's name never appears on this page. Only these public
 * fields ship; the governance records (source, approval state) stay in
 * `landing-v2.ts`, and `landing-ga-page.test.ts` asserts each entry matches
 * its governance record verbatim. Publication approval per quote is still
 * pending on ticket #10.
 */
export const gaTestimonials: ReadonlyArray<GaTestimonial> = [
  {
    id: "pg-read-speed",
    quote:
      "Wow, so fast! Within 10 minutes, so many parents had already checked and read it. It's even faster than Facebook and Instagram.",
    role: "Corporate Comms & Education Outreach Staff",
    schoolLevel: "Secondary School",
  },
  {
    id: "pg-immediacy",
    quote: "It's the immediacy of the outreach — it's almost instant.",
    role: "Head of Department",
    schoolLevel: "Secondary School",
  },
  {
    id: "pg-work-reduction",
    quote:
      "A lot of enhancements have been made to facilitate and cut down some of the work done in school. We are quite grateful.",
    role: "Vice Principal",
    schoolLevel: "Primary School",
  },
]

export const gaSectionAnchors = {
  journey: "journey",
  apps: "apps",
  audiences: "audiences",
  schools: "schools",
} as const

export const gaNavItems = [
  { label: "The journey", href: `#${gaSectionAnchors.journey}` },
  { label: "The apps", href: `#${gaSectionAnchors.apps}` },
  { label: "Real schools", href: `#${gaSectionAnchors.schools}` },
] as const

export const gaPageCopy = {
  meta: {
    title: metaDocument.requireHeading(),
    description: metaDocument.requireBody(),
  },
  hero: {
    headline: heroDocument.requireHeading(),
    body: heroDocument.requireBody(),
    action: heroDocument.text("action"),
    actionNote: heroDocument.text("actionNote"),
  },
  journey: {
    // CNT-4: the student and records on screen are purpose-built synthetic.
    syntheticNote: storyDocument.text("syntheticNote"),
  },
  reveal: {
    eyebrow: revealDocument.text("eyebrow"),
    headline: revealDocument.requireHeading(),
    body: revealDocument.requireBody(),
    launchLine: revealDocument.optionalText("launchLine"),
  },
  apps: {
    heading: capabilitiesDocument.requireHeading(),
    lede: capabilitiesDocument.requireBody(),
  },
  audiences: {
    heading: audiencesDocument.requireHeading(),
  },
  schools: {
    heading: proofDocument.requireHeading(),
    lede: proofDocument.text("publicLede"),
  },
  close: {
    headline: closeDocument.requireHeading(),
    body: closeDocument.requireBody(),
  },
} as const
