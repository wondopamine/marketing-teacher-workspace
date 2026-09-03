import { ArrowUpRightIcon } from "lucide-react"

import { footerCopy } from "@/content/landing"

const advisory = footerCopy.advisory

/**
 * The page's foot, and the two things a public-facing government site owes its
 * visitors (review, 2026-09-03): the impersonation-scam advisory, and a way to
 * report a vulnerability.
 *
 * The advisory is a band of its own above the footer's row, full-bleed and
 * ruled off, because it is a notice about the government rather than about
 * this product — the same separation the reference implementation makes. The
 * vulnerability link sits beside "Send feedback": both are places to write to,
 * and keeping them in one cell leaves the three-column rhythm (copyright,
 * wordmark, links) intact.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--paper-rule)] bg-[color:var(--footer-bg)]">
      <div className="border-b border-[color:var(--paper-rule)] bg-[color:var(--advisory-bg)] px-6 py-3 sm:px-12 lg:px-20">
        <p className="mx-auto w-full max-w-[1280px] text-center font-body text-[13px] leading-5 text-[color:var(--paper-ink)]">
          <span className="font-semibold">{advisory.lead}</span>{" "}
          {advisory.warning} {advisory.helplineBefore}{" "}
          <a
            className="rounded underline decoration-[color:var(--paper-rule-strong)] underline-offset-2 transition-colors duration-200 ease-out hover:text-primary hover:decoration-current focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none"
            href={advisory.helplineLinkUrl}
            rel="noreferrer"
            target="_blank"
          >
            {advisory.helplineLinkLabel}
          </a>{" "}
          {advisory.helplineAfter}
        </p>
      </div>

      <div className="px-6 py-10 sm:px-12 sm:py-14 lg:px-20">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-6 sm:grid sm:grid-cols-3 sm:items-center sm:gap-0">
          <p className="order-2 text-sm leading-5 text-[color:var(--paper-muted)] sm:order-none sm:justify-self-start">
            {footerCopy.copyright}
          </p>
          <a
            aria-label={footerCopy.brand}
            className="order-1 flex min-h-11 items-center gap-2.5 rounded-md font-heading text-[color:var(--paper-ink)] transition-opacity duration-200 ease-out hover:opacity-80 focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none sm:order-none sm:justify-self-center"
            href="/"
          >
            <img
              alt=""
              aria-hidden
              className="h-8 w-auto select-none"
              height={640}
              src="/hero/tw-logo.svg"
              width={2099}
            />
          </a>
          <div className="order-3 flex flex-col items-center gap-2 sm:order-none sm:flex-row sm:gap-5 sm:justify-self-end">
            <a
              className="group/feedback inline-flex min-h-11 items-center gap-1.5 rounded text-sm leading-5 text-[color:var(--paper-muted)] transition-colors duration-200 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-6"
              href={footerCopy.feedbackUrl}
              rel="noreferrer"
              target="_blank"
            >
              {footerCopy.feedbackLabel}
              <ArrowUpRightIcon
                aria-hidden
                className="size-3.5 transition-transform duration-200 ease-out group-hover/feedback:translate-x-px group-hover/feedback:-translate-y-px"
              />
            </a>
            <a
              className="group/report inline-flex min-h-11 items-center gap-1.5 rounded text-sm leading-5 text-[color:var(--paper-muted)] transition-colors duration-200 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-6"
              href={footerCopy.reportVulnerabilityUrl}
              rel="noreferrer"
              target="_blank"
            >
              {footerCopy.reportVulnerabilityLabel}
              <ArrowUpRightIcon
                aria-hidden
                className="size-3.5 transition-transform duration-200 ease-out group-hover/report:translate-x-px group-hover/report:-translate-y-px"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
