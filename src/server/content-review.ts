import { createServerFn } from "@tanstack/react-start"

export const getContentReviewPageData = createServerFn({
  method: "GET",
}).handler(async () => {
  const { buildContentReviewPageDto } =
    await import("../content/landing-v2-review-state.server")
  return buildContentReviewPageDto()
})
