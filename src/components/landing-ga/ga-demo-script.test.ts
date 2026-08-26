import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { defineScript, typedFrames, useDemoScript } from "./ga-demo-script"

const script = defineScript(1000, [
  [0, "a"],
  [300, "b"],
  [600, "c"],
])

describe("useDemoScript", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("rests on the last frame when not playing", () => {
    const { result } = renderHook(() => useDemoScript(script, false))
    expect(result.current).toBe("c")
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current).toBe("c")
  })

  it("plays the frames in time, twice, then stays on the last one", () => {
    const { result } = renderHook(() => useDemoScript(script, true))
    expect(result.current).toBe("a")
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe("b")
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe("c")
    // Second pass starts from the top after the pass length.
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current).toBe("a")
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(result.current).toBe("c")
    // No third pass: auto-updating content stops on its own.
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current).toBe("c")
  })

  it("drops to the last frame and clears its timers when deactivated", () => {
    const { result, rerender } = renderHook(
      ({ active }: { active: boolean }) => useDemoScript(script, active),
      { initialProps: { active: true } }
    )
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe("b")
    rerender({ active: false })
    expect(result.current).toBe("c")
    expect(vi.getTimerCount()).toBe(0)
  })

  it("replays from the top when reactivated", () => {
    const { result, rerender } = renderHook(
      ({ active }: { active: boolean }) => useDemoScript(script, active),
      { initialProps: { active: true } }
    )
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    rerender({ active: false })
    rerender({ active: true })
    expect(result.current).toBe("a")
  })
})

describe("defineScript", () => {
  it("refuses a frame past the pass length", () => {
    expect(() =>
      defineScript(500, [
        [0, 0],
        [600, 1],
      ])
    ).toThrow(/past/)
  })
})

describe("typedFrames", () => {
  it("spells the text out one character per tick", () => {
    expect(typedFrames(100, "60", 150, (typed) => typed)).toEqual([
      [100, "6"],
      [250, "60"],
    ])
  })
})
