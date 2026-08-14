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
    src: "/content-review/screens/student-insights-class.png",
    alt: "Teacher Workspace Student Insights table for a Secondary 3 class.",
    breadcrumb: ["Student Insights", "Class 3B"],
    brief: brief("story-promise"),
  },
  {
    id: "story-notice",
    src: "/content-review/screens/student-profile-family.png",
    alt: "Family section of a synthetic student profile in Teacher Workspace.",
    breadcrumb: ["Home", "Profile", "Rachel Wong Mei Ling"],
    brief: brief("story-notice"),
  },
  {
    id: "story-next-steps",
    src: "/content-review/screens/guidance.png",
    alt: "Teacher Workspace student-support guidance opened from a recommended action.",
    breadcrumb: ["AI next-step guidance", "Prototype gap"],
    brief: brief("story-next-steps"),
  },
  {
    id: "story-words",
    src: "/content-review/screens/post-composer.png",
    alt: "Existing Teacher Workspace Posts composer with AI Draft and an editable parent preview.",
    breadcrumb: ["Posts", "New Post", "AI Draft"],
    brief: brief("story-words"),
  },
  {
    id: "story-family-and-record",
    src: "/content-review/screens/post-read-tracking.png",
    alt: "Teacher Workspace sent post with posted status and recipient read tracking.",
    breadcrumb: ["Posts", "Term 4 Letter to Parents"],
    brief: brief("story-family-and-record"),
  },
] as const satisfies ReadonlyArray<TeacherPreviewScreenRecord>
