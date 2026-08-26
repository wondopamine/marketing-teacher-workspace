import { useEffect, useState } from "react"

/**
 * One keyframe of a scripted demonstration: the screen's state from `at`
 * milliseconds into a pass until the next frame takes over.
 */
export type DemoFrame<TState> = {
  readonly at: number
  readonly state: TState
}

export type DemoScript<TState> = {
  /** In `at` order, the first at 0. The last frame is the settled state. */
  readonly frames: readonly [DemoFrame<TState>, ...Array<DemoFrame<TState>>]
  /** Length of one pass in ms, including the hold on the last frame. */
  readonly duration: number
  /** Passes to play before coming to rest on the last frame. */
  readonly passes?: number
}

export const DEFAULT_PASSES = 2

/**
 * Plays a scripted demonstration while `active`, then comes to rest.
 *
 * The journey's screens perform rather than respond: each is a timeline of
 * states, the way the reference's demo is (paper.design, read off the owner's
 * recording, 2026-08-26). This hook is that timeline. While `active` it steps
 * through `frames` from t=0, starts over after `duration`, and after `passes`
 * passes stops on the last frame for good. Whenever it is not playing — on the
 * server, before hydration, with the act off screen, under reduced motion (the
 * caller folds that into `active`) — it returns the last frame, so the settled
 * composition is what every non-playing render shows. Auto-updating content
 * that stops on its own is how the journey has met WCAG 2.2.2 since round 3.
 *
 * Every frame is its own `setTimeout` from the moment `active` flips true: at
 * most passes × frames timers, cleared together. An interval would drift, and
 * a chain would need bookkeeping this does not.
 */
export function useDemoScript<TState>(
  script: DemoScript<TState>,
  active: boolean
): TState {
  const { frames, duration, passes = DEFAULT_PASSES } = script
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!active) {
      setIndex(null)
      return
    }
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let pass = 0; pass < passes; pass += 1) {
      frames.forEach((frame, frameIndex) => {
        const at = pass * duration + frame.at
        if (at === 0) {
          setIndex(0)
          return
        }
        timers.push(setTimeout(() => setIndex(frameIndex), at))
      })
    }
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
  }, [active, frames, duration, passes])

  const settled = frames[frames.length - 1] ?? frames[0]
  const current = index === null ? undefined : frames[index]
  return (current ?? settled).state
}

/**
 * A script from `[at, state]` pairs, so a screen's timeline reads as a table.
 * `duration` is the pass length; frames past it are a mistake and throw.
 */
export function defineScript<TState>(
  duration: number,
  keyframes: readonly [
    readonly [number, TState],
    ...Array<readonly [number, TState]>,
  ],
  passes?: number
): DemoScript<TState> {
  const frames = keyframes.map(([at, state]) => {
    if (at > duration) {
      throw new Error(`demo frame at ${at}ms is past the ${duration}ms pass`)
    }
    return { at, state }
  }) as [DemoFrame<TState>, ...Array<DemoFrame<TState>>]
  return passes === undefined
    ? { frames, duration }
    : { frames, duration, passes }
}

/**
 * The frames that spell `text` out one character per `tick` from `start`:
 * `toState` receives each prefix. A demo that "types" a value is these, spread
 * into its keyframes.
 */
export function typedFrames<TState>(
  start: number,
  text: string,
  tick: number,
  toState: (typed: string) => TState
): ReadonlyArray<readonly [number, TState]> {
  return Array.from(
    text,
    (_, i) => [start + i * tick, toState(text.slice(0, i + 1))] as const
  )
}
