import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"

import { GaHero } from "./ga-hero"

describe("GaHero", () => {
  it("serves the drifting clouds through the AVIF and WebP variants", () => {
    // The 1.1MB PNG, drawn twice, was the whole mobile first-paint budget
    // (measured 2026-08-24). It stays only as the last-resort <img> source.
    const { container } = render(<GaHero />)
    const clouds = [...container.querySelectorAll("picture")]
    expect(clouds).toHaveLength(2)
    for (const cloud of clouds) {
      const sources = [...cloud.querySelectorAll("source")].map((source) => [
        source.getAttribute("type"),
        source.getAttribute("srcset"),
      ])
      expect(sources).toEqual([
        ["image/avif", "/hero/cloud-halftone.avif"],
        ["image/webp", "/hero/cloud-halftone.webp"],
      ])
      const img = cloud.querySelector("img")
      expect(img?.getAttribute("src")).toBe("/hero/cloud-halftone.png")
      // Declared intrinsic size, so the ratio is known before the bytes land.
      expect(img?.getAttribute("width")).toBe("1274")
      expect(img?.getAttribute("height")).toBe("1274")
    }
  })
})
