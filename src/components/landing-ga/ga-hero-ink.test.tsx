import { describe, expect, it, vi } from "vitest"
import { render, waitFor } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"

import { GaHeroInk } from "./ga-hero-ink"

/** Stands in for the global setup shim, one query answer at a time. */
function stubMatchMedia(answers: {
  reducedMotion: boolean
  finePointer: boolean
}) {
  return vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion")
      ? answers.reducedMotion
      : answers.finePointer,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }))
}

describe("GaHeroInk", () => {
  it("renders nothing on the server", () => {
    // The trail is decorative and client-only; the settled composition the
    // server ships must not contain it (same contract as the hero video).
    expect(renderToStaticMarkup(<GaHeroInk />)).toBe("")
  })

  it("renders nothing when the visitor asks for reduced motion", async () => {
    // The global setup shim answers `matches: true` to every query, which is
    // the reduced-motion branch.
    const { container } = render(<GaHeroInk />)
    await waitFor(() => expect(container.querySelector("canvas")).toBeNull())
  })

  it("renders nothing for a coarse pointer", async () => {
    // Touch has no pointer to follow, so there is nothing to draw.
    const original = window.matchMedia
    window.matchMedia = stubMatchMedia({
      reducedMotion: false,
      finePointer: false,
    }) as unknown as typeof window.matchMedia
    try {
      const { container } = render(<GaHeroInk />)
      await waitFor(() => expect(container.querySelector("canvas")).toBeNull())
    } finally {
      window.matchMedia = original
    }
  })

  it("mounts a decorative canvas for a fine pointer when motion is allowed", async () => {
    const original = window.matchMedia
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    window.matchMedia = stubMatchMedia({
      reducedMotion: false,
      finePointer: true,
    }) as unknown as typeof window.matchMedia
    // jsdom has no 2D context; returning null exercises the guard that keeps
    // the component inert rather than throwing where canvas is unavailable.
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
    try {
      const { container } = render(<GaHeroInk />)
      const canvas = await waitFor(() => {
        const found = container.querySelector("canvas")
        expect(found).not.toBeNull()
        return found
      })
      expect(canvas?.getAttribute("aria-hidden")).toBe("true")
      expect(canvas?.className).toContain("pointer-events-none")
    } finally {
      window.matchMedia = original
      HTMLCanvasElement.prototype.getContext = originalGetContext
    }
  })
})
