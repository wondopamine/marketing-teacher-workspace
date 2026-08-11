import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  ReviewAnnotationProvider,
  ReviewPin,
  useReviewAnnotations,
} from "./review-annotations"

function Harness() {
  const { panelOpen, selectedId, setPinsVisible } = useReviewAnnotations()
  return (
    <>
      <ReviewPin id="story-overview" />
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

    const pin = screen.getByRole("button", { name: "Review note: Story flow" })
    expect(pin.getAttribute("aria-expanded")).toBe("false")
    expect(screen.getByText("Closed")).not.toBeNull()

    fireEvent.click(pin)
    expect(pin.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("Open: story-overview")).not.toBeNull()

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
      screen.queryByRole("button", { name: "Review note: Story flow" })
    ).toBeNull()
  })
})
