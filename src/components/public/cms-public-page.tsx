import type { CmsPublicPageDto } from "@/cms/public-page"
import { ContentReviewPage } from "@/components/content-review/content-review-page"
import { siteConfig } from "@/config/site"

export function CmsPublishedPage({
  page,
}: {
  readonly page: CmsPublicPageDto
}) {
  return (
    <div className="bg-muted pt-[var(--masthead-h)]">
      <ContentReviewPage
        data={{ kind: "ready", document: page.document }}
        showReviewPins={false}
        publicLinks={{
          product: siteConfig.links.product,
          feedback: siteConfig.links.feedback,
        }}
      />
    </div>
  )
}
