import accessSupportSource from "/content/landing/09-access-support.mdx"
import audiencesSource from "/content/landing/07-audiences.mdx"
import capabilitiesSource from "/content/landing/05-capabilities.mdx"
import proofSource from "/content/landing/08-proof.mdx"
import revealSource from "/content/landing/04-reveal.mdx"
import screensSource from "/content/screens.mdx"
import storySource from "/content/landing/03-story.mdx"
import wireframeSource from "/content/wireframe.mdx"

import { MdxDocument, itemBody, itemHeading } from "@/content/mdx-document"

/**
 * The wireframe's own labels and the described product screens. Both stay
 * route-local: they explain what each landing slot should show, so they are
 * not part of the reviewed public copy, the review snapshots, or the server
 * DTO. See docs/decisions/2026-08-05-pm-facing-content-review-wireframe.md.
 *
 * The words still live in `content/`, so a PM edits them beside the copy they
 * describe rather than in a TypeScript map.
 */

const wireframe = new MdxDocument(wireframeSource)
const screens = new MdxDocument(screensSource)
const story = new MdxDocument(storySource)
const reveal = new MdxDocument(revealSource)
const capabilities = new MdxDocument(capabilitiesSource)
const audiences = new MdxDocument(audiencesSource)
const proof = new MdxDocument(proofSource)
const accessSupport = new MdxDocument(accessSupportSource)

export type SectionChrome = {
  readonly label: string | null
  readonly title: string
  readonly intro: string | null
}

export type ContentReviewScreen = {
  readonly heading: string
  readonly body: string
  readonly keyElements: ReadonlyArray<string>
  /**
   * Set when the story claims an interface the product does not have yet.
   * Carries the shared tag text and the specific question for the PM.
   */
  readonly pendingInterface: {
    readonly label: string
    readonly question: string
  } | null
}

function sectionChrome(document: MdxDocument): SectionChrome {
  return {
    label: document.optionalText("label"),
    title: document.requireHeading(),
    intro: document.body.length > 0 ? document.body.join(" ") : null,
  }
}

function screen(id: string): ContentReviewScreen {
  const item = screens.item(id)
  if (item.bullets.length !== 3) {
    screens.fail(
      `<Item id="${id}"> needs exactly three bullets; it has ${item.bullets.length}.`
    )
  }
  const question = screens.optionalText(`pendingInterface-${id}`)
  return {
    heading: itemHeading(screens, item),
    body: itemBody(screens, item),
    keyElements: item.bullets,
    pendingInterface: question
      ? { label: screens.text("pendingInterfaceLabel"), question }
      : null,
  }
}

export const contentReviewChrome = {
  artifactLabel: wireframe.text("artifactLabel"),
  badge: wireframe.text("badge"),
  statusNote: wireframe.text("statusNote"),
  warning: itemBody(wireframe, wireframe.item("warning")),
  pendingLabel: wireframe.text("pendingLabel"),
  pendingNote: itemBody(wireframe, wireframe.item("pending-note")),
  story: sectionChrome(story),
  narrative: {
    noticeHeading: story.text("noticeHeading"),
    actHeading: story.text("actHeading"),
    communicateHeading: story.text("communicateHeading"),
  },
  revealLabel: reveal.text("label"),
  capabilities: sectionChrome(capabilities),
  audiences: {
    ...sectionChrome(audiences),
    pendingNote: audiences.text("pendingNote"),
  },
  proof: {
    ...sectionChrome(proof),
    pendingLabel: proof.text("pendingLabel"),
  },
  accessSupport: {
    ...sectionChrome(accessSupport),
    accessHeading: accessSupport.text("accessHeading"),
    accessMethodLabel: accessSupport.text("accessMethodLabel"),
    supportHeading: accessSupport.text("supportHeading"),
    pendingLabel: accessSupport.text("pendingLabel"),
  },
} as const

export type ContentReviewChrome = typeof contentReviewChrome

/**
 * Screen briefs in the order the sections render them. Listing the ids here
 * keeps this module free of the server content contract, and lets the parser
 * reject a renamed, duplicated, or orphaned block in `content/screens.mdx`.
 */
const storyScreenIds = [
  "story-promise",
  "story-notice",
  "story-next-steps",
  "story-words",
  "story-family-and-record",
] as const

screens.requireItems(["hero", ...storyScreenIds])

export const contentReviewScreens = {
  label: screens.text("label"),
  hero: screen("hero"),
  story: storyScreenIds.map(screen),
} as const
