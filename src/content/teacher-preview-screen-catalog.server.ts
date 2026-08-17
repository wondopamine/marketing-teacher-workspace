import "@tanstack/react-start/server-only"

import { itemBody, itemHeading } from "./mdx-document"
import { landingDocuments } from "./landing-copy"

import type { TeacherPreviewScreenDto } from "./teacher-preview-document"

export const teacherPreviewScreenIds = [
  "hero",
  "story-promise",
  "story-notice",
  "story-next-steps",
  "story-words",
  "story-family-and-record",
] as const

export type TeacherPreviewScreenId = (typeof teacherPreviewScreenIds)[number]

export type TeacherPreviewScreenRecord = TeacherPreviewScreenDto & {
  /** Server-side binding key. It is stripped from the browser document. */
  readonly id: TeacherPreviewScreenId
}

function brief(id: TeacherPreviewScreenId) {
  const item = landingDocuments.screens.item(id)
  const label =
    item.label ??
    landingDocuments.screens.fail(
      `<Item id="${id}"> needs a prototype-status label.`
    )
  if (item.bullets.length !== 3) {
    landingDocuments.screens.fail(
      `<Item id="${id}"> needs exactly three interface elements.`
    )
  }
  return {
    label,
    heading: itemHeading(landingDocuments.screens, item),
    body: itemBody(landingDocuments.screens, item),
    keyElements: [...item.bullets],
  }
}

export const teacherPreviewScreenCatalog = [
  {
    id: "hero",
    src: "/content-review/screens/student-profile.png",
    alt: "Existing Teacher Workspace Student Insights profile with attendance, behaviour, wellbeing, academic, and family sections.",
    breadcrumb: ["Home", "Profile", "Rachel Wong Mei Ling"],
    brief: brief("hero"),
  },
  {
    id: "story-promise",
    src: "/content-review/screens/observations.png",
    alt: "Observations panel on a synthetic student profile, showing one recorded observation with a positive tag.",
    breadcrumb: ["Home", "Profile", "Observations"],
    brief: brief("story-promise"),
  },
  {
    id: "story-notice",
    src: "/content-review/screens/student-profile-family.png",
    alt: "Wellbeing section of a synthetic student profile, showing risk indicators, low-mood flag, and social links.",
    breadcrumb: ["Home", "Profile", "Wellbeing"],
    brief: brief("story-notice"),
  },
  {
    id: "story-next-steps",
    src: "/content-review/screens/guidance.png",
    alt: "A single suggested next-step card describing progress to sustain, with the colleague to contact and the reference guide behind it.",
    breadcrumb: ["AI next-step guidance", "Release 2"],
    brief: brief("story-next-steps"),
  },
  {
    id: "story-words",
    src: "/content-review/screens/post-composer.png",
    alt: "AI Draft template picker in the Posts composer, offering four templates and stating the draft is for the teacher to review and edit before posting.",
    breadcrumb: ["Posts", "New Post", "AI Draft"],
    brief: brief("story-words"),
  },
  {
    id: "story-family-and-record",
    src: "/content-review/screens/post-read-tracking.png",
    alt: "Overview tile of a sent post, showing two of three recipients have read it and one is unread.",
    breadcrumb: ["Posts", "Term 4 Letter to Parents"],
    brief: brief("story-family-and-record"),
  },
] as const satisfies ReadonlyArray<TeacherPreviewScreenRecord>
