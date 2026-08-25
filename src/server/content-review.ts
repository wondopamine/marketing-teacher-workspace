import { createServerFn } from "@tanstack/react-start"

import type { TeacherPreviewPageDataDto } from "../content/teacher-preview-document"

export const getContentReviewPageData = createServerFn({
  method: "GET",
}).handler(async (): Promise<TeacherPreviewPageDataDto> => {
  const { buildTeacherPreviewPageData } =
    await import("../content/teacher-preview-document.server")
  return buildTeacherPreviewPageData()
})
