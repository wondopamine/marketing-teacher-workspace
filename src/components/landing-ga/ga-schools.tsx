import {
  GaSchoolClip,
  GaSchoolClipPlaceholder,
} from "@/components/landing-ga/ga-school-clip"
import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import {
  gaPageCopy,
  gaSectionAnchors,
  gaTestimonials,
} from "@/content/landing-ga-page"
import { cn } from "@/lib/utils"

/**
 * The clip that runs beside each school's words, keyed by testimonial id.
 * Presentation, so it lives here rather than in the governed dataset — the
 * quotes are verbatim staff copy under a sync contract with `landing-v2.ts`,
 * and media is not part of that contract.
 *
 * `src` is absent until the file exists and the row draws a placeholder in the
 * clip's exact geometry, so landing the real one cannot move the layout. To
 * ship a clip, drop it at the path below and add `src` (plus a `poster` still,
 * which is what reduced-motion readers see): the rest is already wired.
 *
 * Note for whoever exports them: `.mov` is a QuickTime container that Chrome
 * and Firefox will not play. Export H.264 in an `.mp4`, or VP9 in a `.webm`.
 */
const SCHOOL_CLIPS: Record<string, { poster?: string; src?: string }> = {
  "pg-read-speed": {},
  "pg-immediacy": {},
  "pg-work-reduction": {},
}

const clipPath = (id: string) => `/schools/${id}.mp4`

/**
 * Section 6 of the IA: verbatim staff quotes, role and school level only,
 * scoped to Posts — the capability the verbatims actually evidence (ADR 0003).
 *
 * The three memo cards are gone (owner, 2026-08-25). The section now runs the
 * alternating illustrated rows from the dx-harness landing
 * (transformteamsg/dx-harness, `app/(landing)/page.tsx`): one clip beside one
 * claim, the pair swapping sides each row. Two details of that pattern are
 * load-bearing and are kept exactly. DOM order always puts the clip first, so
 * below `lg` every row reads clip-then-words in one rhythm and the flip is
 * purely visual (`lg:order-2`). And the seam hairline follows the flip —
 * `lg:border-l` when the clip has moved right, `lg:border-r` when it has not —
 * so the divider always sits between the two cells rather than jumping.
 *
 * The section's tinted band is gone with them (owner, 2026-08-25); the rows sit
 * on the page ground, which is also what `mix-blend-multiply` needs — on a
 * tinted ground the blend would take every white inside the drawings down to
 * the tint, the defect the hero illustration hit the same day.
 */
export function GaSchools() {
  return (
    <section
      aria-labelledby="ga-schools-title"
      className="scroll-mt-28 px-5 py-20 sm:px-8 lg:py-24"
      id={gaSectionAnchors.schools}
    >
      <div className="mx-auto w-full max-w-[1220px]">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="font-heading text-[clamp(1.75rem,4vw,3.5rem)] leading-[1.08] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
              id="ga-schools-title"
            >
              {gaPageCopy.schools.heading}
            </h2>
            <p className="mt-6 font-body text-base leading-[1.7] text-balance text-[color:var(--paper-muted)] sm:text-lg">
              {gaPageCopy.schools.lede}
            </p>
          </div>
        </RevealOnScroll>

        <ul className="mt-14 list-none border-t border-[color:var(--paper-rule)] lg:mt-20">
          {gaTestimonials.map((testimonial, index) => {
            const clip = SCHOOL_CLIPS[testimonial.id] ?? {}
            // Odd rows send the clip to the right at lg; the seam follows it.
            const flipped = index % 2 === 1
            return (
              <li
                className="grid border-b border-[color:var(--paper-rule)] last:border-b-0 lg:grid-cols-2"
                key={testimonial.id}
              >
                <div
                  className={cn(
                    "grid place-items-center border-[color:var(--paper-rule)] px-6 py-10 max-lg:border-b sm:p-12",
                    flipped ? "lg:order-2 lg:border-l" : "lg:border-r"
                  )}
                >
                  {clip.src ? (
                    <GaSchoolClip poster={clip.poster} src={clip.src} />
                  ) : (
                    <GaSchoolClipPlaceholder
                      expectedPath={clipPath(testimonial.id)}
                    />
                  )}
                </div>

                <blockquote className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12">
                  <p className="font-body text-[12px] leading-4 font-medium tracking-[0.02em] text-[color:var(--paper-muted)] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-4 max-w-[32ch] text-xl leading-[30px] font-medium tracking-[-0.01em] text-pretty text-[color:var(--paper-ink)] italic sm:text-2xl sm:leading-[36px]">
                    {`“${testimonial.quote}”`}
                  </p>
                  <footer className="mt-6">
                    <p className="font-body text-sm leading-5 font-semibold text-[color:var(--paper-ink)]">
                      {testimonial.role}
                    </p>
                    <p className="mt-0.5 font-body text-sm leading-5 text-[color:var(--paper-muted)] italic">
                      {testimonial.schoolLevel}
                    </p>
                  </footer>
                </blockquote>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
