import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  ReviewAnnotationDetails,
  ReviewAnnotationProvider,
  ReviewPin,
  reviewAnnotationBindings,
  reviewAnnotations,
  useReviewAnnotations,
} from "./review-annotations"
import { contentReviewScreens } from "./content-review-chrome"

function Harness() {
  const { panelOpen, selectedId, setPinsVisible } = useReviewAnnotations()
  return (
    <>
      <ReviewPin id="notice-and-understand-overview" />
      <output>{panelOpen ? `Open: ${selectedId}` : "Closed"}</output>
      <button type="button" onClick={() => setPinsVisible(false)}>
        Pause pins
      </button>
    </>
  )
}

describe("review annotations", () => {
  it("opens and closes the rationale panel from an accessible pin", () => {
    render(
      <ReviewAnnotationProvider>
        <Harness />
      </ReviewAnnotationProvider>
    )

    const pin = screen.getByRole("button", {
      name: "Review note: Notice and understand",
    })
    expect(pin.getAttribute("aria-expanded")).toBe("false")
    expect(screen.getByText("Closed")).not.toBeNull()

    fireEvent.click(pin)
    expect(pin.getAttribute("aria-expanded")).toBe("true")
    expect(
      screen.getByText("Open: notice-and-understand-overview")
    ).not.toBeNull()

    fireEvent.click(pin)
    expect(pin.getAttribute("aria-expanded")).toBe("false")
    expect(screen.getByText("Closed")).not.toBeNull()
  })

  it("temporarily removes pins while direct editing is active", () => {
    render(
      <ReviewAnnotationProvider>
        <Harness />
      </ReviewAnnotationProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Pause pins" }))

    expect(
      screen.queryByRole("button", {
        name: "Review note: Notice and understand",
      })
    ).toBeNull()
  })

  it("carries a screen's build state and rationale in its reviewer note", () => {
    const hero = reviewAnnotations.find(
      (annotation) => annotation.id === reviewAnnotationBindings.heroScreen
    )
    if (!hero) throw new Error("Expected the hero screen annotation")

    render(<ReviewAnnotationDetails annotation={hero} />)

    // The rationale that used to sit inline under the capture now lives here.
    expect(screen.getByText("Reviewer note")).not.toBeNull()
    expect(screen.getByText(contentReviewScreens.hero.provenance)).not.toBeNull()
    expect(screen.getByText(contentReviewScreens.hero.heading)).not.toBeNull()
    expect(screen.getByText(contentReviewScreens.hero.body)).not.toBeNull()
    for (const element of contentReviewScreens.hero.keyElements) {
      expect(screen.getByText(element)).not.toBeNull()
    }
  })

  it("omits the build state on section notes, which have no capture", () => {
    const section = reviewAnnotations.find(
      (annotation) => annotation.id === reviewAnnotationBindings.notice
    )
    if (!section) throw new Error("Expected the notice section annotation")

    const { container } = render(<ReviewAnnotationDetails annotation={section} />)

    expect(section.provenance).toBeUndefined()
    expect(
      container.querySelector("[data-review-annotation-provenance]")
    ).toBeNull()
  })
})
