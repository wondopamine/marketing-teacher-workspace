import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { GaJourney } from "./ga-journey"

import type * as MotionReact from "motion/react"

type InViewOptions = NonNullable<Parameters<typeof MotionReact.useInView>[1]>
const mocks = vi.hoisted(() => ({
  useInView: vi.fn((_ref: unknown, _options?: InViewOptions): boolean => false),
  useReducedMotion: vi.fn((): boolean => false),
}))

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof MotionReact>()
  return {
    ...actual,
    useInView: mocks.useInView,
    useReducedMotion: mocks.useReducedMotion,
  }
})

// The setup file's matchMedia stub reports `matches: true`, so the journey
// sees a desktop viewport; each test decides in-view and reduced motion.
// One mock answers the mount gate (`useInView` on the section); the active act
// comes from an IntersectionObserver the setup file stubs to never fire, so the
// anchored stage stays on act 1.

/** Let React.lazy resolve and the Suspense boundary re-render. */
async function settleLazy() {
  await act(async () => {
    await new Promise((resolve) => setImmediate(resolve))
  })
}
describe("GaJourney", () => {
  beforeEach(async () => {
    // The screens are a lazy chunk; load it once so React.lazy resolves in a
    // microtask, and leave setImmediate real so React's scheduler can flush
    // the boundary under fake timers.
    await import("./ga-screens")
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "Date",
      ],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
    mocks.useInView.mockReset()
    mocks.useReducedMotion.mockReset()
  })

  it("plays an act's script while it holds the viewport", async () => {
    mocks.useInView.mockReturnValue(true)
    mocks.useReducedMotion.mockReturnValue(false)
    const { container } = render(<GaJourney />)
    await settleLazy()
    // The settled frame's panel leaves as frame 0 arrives, and under fake
    // timers its exit never completes — so the beats are asserted from the
    // first frame that opens the panel, not from what has left the stage.
    act(() => {
      vi.advanceTimersByTime(1100)
    })
    expect(container.textContent).toContain("14 of 14 found")
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(container.textContent).toContain("7 of 14 found")
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(container.textContent).toContain("3 of 14 found")
  })

  it("mounts no screen while the journey is far from the viewport", async () => {
    mocks.useInView.mockReturnValue(false)
    mocks.useReducedMotion.mockReturnValue(false)
    const { container } = render(<GaJourney />)
    await settleLazy()
    expect(container.textContent).toContain("You identify")
    expect(container.textContent).toContain("A demonstration:")
    expect(container.textContent).not.toContain("of 14 found")
    expect(vi.getTimerCount()).toBe(0)
  })

  it("rests on the settled frames under reduced motion, even in view", async () => {
    mocks.useInView.mockReturnValue(true)
    mocks.useReducedMotion.mockReturnValue(true)
    const { container } = render(<GaJourney />)
    await settleLazy()
    expect(container.textContent).toContain("3 of 14 found")
    expect(container.textContent).toContain(
      "Consider keeping the daily check-in going"
    )
    expect(vi.getTimerCount()).toBe(0)
    act(() => {
      vi.advanceTimersByTime(20000)
    })
    expect(container.textContent).toContain("3 of 14 found")
  })

  it("puts the act's words, and only its words, in the act block", async () => {
    mocks.useInView.mockReturnValue(true)
    mocks.useReducedMotion.mockReturnValue(true)
    const { container } = render(<GaJourney />)
    await settleLazy()
    const block = container.querySelector("#act-promise")
    expect(block?.textContent).toContain("You identify")
    // The screen is illustration beside the act, never inside it.
    expect(block?.textContent).not.toContain("of 14 found")
  })
})
