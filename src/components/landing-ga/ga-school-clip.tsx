import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * One hand-drawn clip beside a school's words, in the shape the dx-harness
 * landing uses for its illustrated feature rows
 * (`components/landing/illo-video.tsx` in transformteamsg/dx-harness).
 *
 * Playback follows visibility: the clip runs while at least half of it is on
 * screen and pauses when it leaves, so nothing animates unwatched, and a page
 * with three of them never has three videos decoding at once. Under
 * `prefers-reduced-motion` nothing plays at all — the poster rests, and the
 * preference is re-read on change so a mid-session toggle is obeyed both ways.
 *
 * There is no play/pause control, which is the same WCAG 2.2.2 gap already
 * recorded for the hero loop: a reader who has not set the OS preference has no
 * way to stop motion that runs past five seconds beside content. The clips are
 * decorative (`aria-hidden`) and muted, and the quote beside each one carries
 * everything the row says.
 *
 * `mix-blend-multiply` matters, and it only works because the ground behind
 * this is near-white. Multiply maps white to the backdrop, so on a tinted one
 * every white inside the drawing — faces, paper, screens — takes the tint. That
 * is exactly the defect the hero illustration hit on 2026-08-25, and it is why
 * this section no longer sits on a band. Keep the ground white, or drop the
 * blend.
 */
export function GaSchoolClip({
  className,
  poster,
  src,
}: {
  className?: string
  /** Poster frame; rests in place of the clip under reduced motion. */
  poster?: string
  src: string
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let inView = false

    const sync = () => {
      if (motionQuery.matches || !inView) {
        video.pause()
        return
      }
      // A blocked autoplay (Low Power Mode, a strict autoplay policy) is not an
      // error here: the poster stays, which is the correct resting state.
      void video.play().catch(() => {})
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.intersectionRatio >= 0.5
          sync()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(video)
    motionQuery.addEventListener("change", sync)
    return () => {
      observer.disconnect()
      motionQuery.removeEventListener("change", sync)
    }
  }, [])

  return (
    <video
      aria-hidden
      className={cn(
        "block aspect-square w-full max-w-80 mix-blend-multiply select-none",
        className
      )}
      loop
      muted
      playsInline
      poster={poster}
      preload="none"
      ref={videoRef}
      src={src}
    />
  )
}

/**
 * Stands in the clip's exact geometry until the file lands, so dropping the
 * real one in cannot move the row. Names the path it is waiting for, because
 * the whole point of a placeholder is that someone can act on it.
 */
export function GaSchoolClipPlaceholder({ expectedPath }: { expectedPath: string }) {
  return (
    <div
      aria-hidden
      className="flex aspect-square w-full max-w-80 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--paper-rule-strong)] bg-[color:var(--paper-hover-bg)] px-4 text-center select-none"
    >
      <p className="font-body text-sm leading-5 font-semibold text-[color:var(--paper-muted)]">
        Clip to come
      </p>
      <p className="font-body text-[12px] leading-4 break-all text-[color:var(--paper-muted)]/80">
        {expectedPath}
      </p>
    </div>
  )
}
