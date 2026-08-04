import { ReviewAnnotation } from "./content-review-outline"

import type { ReactNode } from "react"
import type {
  ContentReviewAppendixDto,
  ContentReviewReadyPageDto,
} from "@/content/landing-v2-review.types"

function TextList({ values }: { values: ReadonlyArray<string> }) {
  return (
    <ul className="mt-3 list-disc space-y-1 pl-5">
      {values.map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  )
}

function AppendixSection({
  children,
  id,
  title,
}: {
  children: ReactNode
  id: string
  title: string
}) {
  return (
    <section aria-labelledby={id} className="pt-8">
      <h3 id={id} className="text-lg font-semibold">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Measurement({
  measurement,
}: {
  measurement: ContentReviewAppendixDto["measurement"]
}) {
  return (
    <section aria-labelledby="content-review-measurement" className="pt-6">
      <h3 id="content-review-measurement" className="text-lg font-semibold">
        Measurement boundary
      </h3>
      <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[11rem_1fr]">
        <dt className="font-medium">Provider strategy</dt>
        <dd>{measurement.providerStrategy}</dd>
        <dt className="font-medium">Engagement owner</dt>
        <dd>{measurement.engagementOwner}</dd>
        <dt className="font-medium">CTA proxy owner</dt>
        <dd>{measurement.conversionProxyOwner}</dd>
        <dt className="font-medium">True conversion owner</dt>
        <dd>{measurement.trueConversionOwner}</dd>
      </dl>
      <p className="mt-4 font-medium">Unresolved decisions</p>
      <TextList values={measurement.unresolvedDecisions} />
      <p className="mt-4 font-medium">Allowed fields</p>
      <TextList values={measurement.allowedFields} />
      <p className="mt-4 font-medium">Prohibited fields</p>
      <TextList values={measurement.prohibitedFields} />
    </section>
  )
}

export function ContentReviewAppendix({
  appendix,
  metadata,
}: {
  appendix: ContentReviewAppendixDto
  metadata: ContentReviewReadyPageDto["metadata"]
}) {
  return (
    <section
      aria-labelledby="content-review-appendix"
      className="border-t border-neutral-300 py-10"
    >
      <h2 id="content-review-appendix" className="text-2xl font-semibold">
        Review appendix
      </h2>

      <AppendixSection id="content-review-metadata" title="Page metadata draft">
        <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[7rem_1fr]">
          <dt className="font-medium">Title</dt>
          <dd>{metadata.heading}</dd>
          <dt className="font-medium">Description</dt>
          <dd>{metadata.body.join(" ")}</dd>
        </dl>
        <ReviewAnnotation context={metadata.review} headingLevel={4} />
      </AppendixSection>

      <AppendixSection
        id="content-review-synthetic"
        title="Synthetic-data boundary"
      >
        <p className="mt-3">{appendix.syntheticData.rule}</p>
        <TextList values={appendix.syntheticData.prohibitedData} />
      </AppendixSection>

      <AppendixSection id="content-review-claims" title="Product claims">
        <p className="mt-3">{appendix.claims.summary}</p>
        <p className="mt-2">
          Unresolved claim items: {appendix.claims.unresolvedCount}
        </p>
      </AppendixSection>

      <AppendixSection
        id="content-review-proof"
        title="Proof and testimonial permission"
      >
        <p className="mt-3">{appendix.proof.summary}</p>
        <p className="mt-4 font-medium">Missing approved coverage</p>
        <TextList values={appendix.proof.missingCapabilityLabels} />
      </AppendixSection>

      <AppendixSection id="content-review-access" title="Access boundary">
        <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[8rem_1fr]">
          <dt className="font-medium">Action</dt>
          <dd>{appendix.access.label}</dd>
          <dt className="font-medium">Account</dt>
          <dd>{appendix.access.accountNote}</dd>
          <dt className="font-medium">Boundary</dt>
          <dd>{appendix.access.implementationBoundary}</dd>
        </dl>
      </AppendixSection>

      <AppendixSection id="content-review-support" title="Support readiness">
        <p className="mt-3">{appendix.support.summary}</p>
      </AppendixSection>

      <Measurement measurement={appendix.measurement} />
    </section>
  )
}
