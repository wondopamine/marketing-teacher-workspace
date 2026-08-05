import type { ReactNode } from "react"
import type {
  ContentReviewStatus,
  ContentReviewWireframeAppendixDto,
  ContentReviewWireframeReadyPageDto,
} from "@/content/landing-v2-review.types"

function humaniseStatus(status: ContentReviewStatus): string {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function TextList({ values }: { values: ReadonlyArray<string> }) {
  if (values.length === 0)
    return <p className="mt-3 text-muted-foreground">None</p>

  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
      {values.map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  )
}

function ReviewNote({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="border-t border-border py-7">
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      {children}
    </section>
  )
}

export function ContentReviewAppendix({
  appendix,
  metadata,
}: {
  appendix: ContentReviewWireframeAppendixDto
  metadata: ContentReviewWireframeReadyPageDto["metadata"]
}) {
  return (
    <section
      aria-labelledby="content-review-appendix"
      className="border-t-8 border-border bg-muted px-6 py-14 md:px-10 md:py-16 lg:px-16"
      data-wireframe-appendix
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(15rem,0.6fr)_minmax(0,1.4fr)] lg:gap-16">
        <div>
          <p className="text-xs font-medium tracking-[0.1em] text-muted-foreground">
            Outside the landing page
          </p>
          <h2
            id="content-review-appendix"
            className="mt-3 font-heading text-2xl font-semibold tracking-[-0.02em] sm:text-[32px]"
          >
            PM review notes
          </h2>
          <p className="mt-4 max-w-md leading-6 text-muted-foreground">
            These notes support content, policy, and security review. They are
            not proposed public-facing copy.
          </p>
        </div>

        <div>
          <ReviewNote title="Page metadata draft">
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-[7rem_1fr]">
              <dt className="font-medium text-muted-foreground">Title</dt>
              <dd>{metadata.heading}</dd>
              <dt className="font-medium text-muted-foreground">Description</dt>
              <dd className="leading-6">{metadata.body.join(" ")}</dd>
              <dt className="font-medium text-muted-foreground">
                Review status
              </dt>
              <dd>{humaniseStatus(metadata.status)}</dd>
            </dl>
          </ReviewNote>

          <ReviewNote title="Content and publication boundaries">
            <dl className="mt-4 space-y-6">
              <div>
                <dt className="font-medium">Synthetic information</dt>
                <dd className="mt-2 leading-6 text-muted-foreground">
                  {appendix.syntheticData.rule}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Product claims</dt>
                <dd className="mt-2 leading-6 text-muted-foreground">
                  {appendix.claims.summary} Unresolved claim items:{" "}
                  {appendix.claims.unresolvedCount}.
                </dd>
              </div>
              <div>
                <dt className="font-medium">Proof and testimonials</dt>
                <dd className="mt-2 leading-6 text-muted-foreground">
                  {appendix.proof.summary}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Support readiness</dt>
                <dd className="mt-2 leading-6 text-muted-foreground">
                  {appendix.support.summary}
                </dd>
              </div>
            </dl>
          </ReviewNote>

          <ReviewNote title="Proof coverage still needed">
            <TextList values={appendix.proof.missingCapabilityLabels} />
          </ReviewNote>

          <ReviewNote title="Measurement boundary">
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-[11rem_1fr]">
              <dt className="font-medium text-muted-foreground">
                Provider strategy
              </dt>
              <dd>{appendix.measurement.providerStrategy}</dd>
              <dt className="font-medium text-muted-foreground">
                Engagement owner
              </dt>
              <dd>{appendix.measurement.engagementOwner}</dd>
              <dt className="font-medium text-muted-foreground">
                CTA proxy owner
              </dt>
              <dd>{appendix.measurement.conversionProxyOwner}</dd>
              <dt className="font-medium text-muted-foreground">
                True conversion owner
              </dt>
              <dd>{appendix.measurement.trueConversionOwner}</dd>
            </dl>

            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div>
                <h4 className="font-heading font-semibold">
                  Unresolved decisions
                </h4>
                <TextList values={appendix.measurement.unresolvedDecisions} />
              </div>
              <div>
                <h4 className="font-heading font-semibold">Allowed fields</h4>
                <TextList values={appendix.measurement.allowedFields} />
              </div>
              <div>
                <h4 className="font-heading font-semibold">
                  Prohibited fields
                </h4>
                <TextList values={appendix.measurement.prohibitedFields} />
              </div>
            </div>
          </ReviewNote>
        </div>
      </div>
    </section>
  )
}
