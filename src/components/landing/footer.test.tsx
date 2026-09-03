import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { SiteFooter } from "./footer"

import { footerCopy } from "@/content/landing"

describe("SiteFooter", () => {
  it("renders a <footer> landmark", () => {
    render(<SiteFooter />)
    expect(screen.getByRole("contentinfo")).not.toBeNull()
  })

  it("renders a feedback link to the go.gov.sg URL", () => {
    render(<SiteFooter />)
    const feedback = screen
      .getAllByRole("link")
      .find((a) => a.getAttribute("href")?.startsWith("https://go.gov.sg/"))
    expect(feedback).not.toBeUndefined()
  })

  it("renders the brand wordmark", () => {
    render(<SiteFooter />)
    expect(screen.getByLabelText(footerCopy.brand)).not.toBeNull()
  })

  // Both are obligations of a public-facing government site (review,
  // 2026-09-03), so they are pinned rather than left to drift.
  it("carries the impersonation-scam advisory, with the ScamShield link", () => {
    render(<SiteFooter />)
    // The lead is its own bold span, so read the paragraph that holds it.
    const advisory = screen
      .getByText(footerCopy.advisory.lead)
      .closest("p")?.textContent
    expect(advisory).toContain(footerCopy.advisory.warning)
    expect(advisory).toContain("1799")
    const scamShield = screen.getByRole("link", { name: "ScamShield" })
    expect(scamShield.getAttribute("href")).toBe(
      footerCopy.advisory.helplineLinkUrl
    )
  })

  it("renders a report-vulnerability link to tech.gov.sg", () => {
    render(<SiteFooter />)
    const report = screen.getByRole("link", {
      name: footerCopy.reportVulnerabilityLabel,
    })
    expect(new URL(report.getAttribute("href") ?? "").hostname).toBe(
      "www.tech.gov.sg"
    )
  })
})
