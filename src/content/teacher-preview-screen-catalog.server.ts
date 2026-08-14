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
  if (item.bullets.length !== 3) {
    landingDocuments.screens.fail(
      `<Item id="${id}"> needs exactly three interface elements.`
    )
  }
  return {
    heading: itemHeading(landingDocuments.screens, item),
    body: itemBody(landingDocuments.screens, item),
    keyElements: [...item.bullets],
  }
}

export const teacherPreviewScreenCatalog = [
  {
    id: "hero",
    src: "/content-review/screens/student-profile.png",
    alt: "Teacher Workspace student profile with attendance, behaviour, wellbeing, and family navigation.",
    breadcrumb: ["Student Insights", "Student profile"],
    brief: brief("hero"),
  },
  {
    id: "story-promise",
    src: "/content-review/screens/student-insights-class.png",
    alt: "Teacher Workspace Student Insights table for a Secondary 3 class.",
    breadcrumb: ["Student Insights", "Class 3A"],
    brief: brief("story-promise"),
  },
  {
    id: "story-notice",
    src: "/content-review/screens/student-profile-family.png",
    alt: "Family section of a synthetic student profile in Teacher Workspace.",
    breadcrumb: ["Student Insights", "Student profile", "Recent observations"],
    brief: brief("story-notice"),
  },
  {
    id: "story-next-steps",
    src: "/content-review/screens/guidance.png",
    alt: "Teacher Workspace student-support guidance opened from a recommended action.",
    breadcrumb: ["Teacher Workspace", "AI next-step guidance", "Guidance"],
    brief: brief("story-next-steps"),
  },
  {
    id: "story-words",
    src: "/content-review/screens/post-composer.png",
    alt: "Teacher Workspace Posts composer with a draft financial-assistance message and parent preview.",
    breadcrumb: ["Message drafting", "Class update"],
    brief: brief("story-words"),
  },
  {
    id: "story-family-and-record",
    src: "/content-review/screens/post-read-tracking.png",
    alt: "Teacher Workspace sent post with posted status and recipient read tracking.",
    breadcrumb: ["Posts", "Sent class update", "Delivery"],
    brief: brief("story-family-and-record"),
  },
] as const satisfies ReadonlyArray<TeacherPreviewScreenRecord>
