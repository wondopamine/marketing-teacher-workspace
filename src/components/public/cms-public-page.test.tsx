import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CmsPublishedPage } from "./cms-public-page"
import { PublicPageMessage } from "./public-page-message"
import { projectCmsPublicPage } from "@/cms/public-page"
import { homepageV1Contract } from "@/cms/templates/homepage-v1.server"
import { siteConfig } from "@/config/site"

describe("CMS public page", () => {
  it("renders only teacher-facing content without review controls", () => {
    const page = projectCmsPublicPage(homepageV1Contract.pageDocument)
    if (!page) throw new Error("Expected a public homepage fixture")

    const { container } = render(<CmsPublishedPage page={page} />)

    expect(screen.getByRole("main")).not.toBeNull()
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(container.querySelector("[data-teacher-preview]")).not.toBeNull()
    expect(container.querySelector("[data-review-pin]")).toBeNull()
    expect(container.querySelector("[contenteditable]")).toBeNull()
    expect(container.textContent).not.toContain("Design intent")
    const signInLinks = screen.getAllByRole("link", {
      name: "Sign in with Google",
    })
    expect(signInLinks).toHaveLength(2)
    expect(
      signInLinks.every(
        (link) => link.getAttribute("href") === siteConfig.links.product
      )
    ).toBe(true)
    expect(
      screen.getByRole("link", { name: "Send feedback" }).getAttribute("href")
    ).toBe(siteConfig.links.feedback)
  })

  it("gives service states one main landmark and a clear heading", () => {
    render(
      <PublicPageMessage
        heading="Website unavailable"
        action={{ href: "/", label: "Go to homepage" }}
      >
        Please try again shortly.
      </PublicPageMessage>
    )

    expect(screen.getByRole("main")).not.toBeNull()
    expect(
      screen.getByRole("heading", { level: 1, name: "Website unavailable" })
    ).not.toBeNull()
    expect(
      screen.getByRole("link", { name: "Go to homepage" }).getAttribute("href")
    ).toBe("/")
  })
})
