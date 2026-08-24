import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { TEACHER_WORKSPACE_APP_URL } from "@/content/landing"
import { gaPageCopy } from "@/content/landing-ga-page"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/**
 * The peaceful hero (stakeholder feedback, 2026-08-21): copy on the locked
 * illustrated sky, and the hand-drawn teacher quietly working below the
 * fold — no product UI, no zoom. The animation is the looping illustration
 * video; `mix-blend-multiply` melts its white ground into the paper sky so
 * it reads as drawn on the page.
 *
 * Entrances stay pure CSS keyframes (`ga-fade-up`), so the server-rendered
 * markup never hides content. The server (and no-JS, and reduced-motion)
 * renders the still frame; the video only mounts after hydration when the
 * visitor allows motion, and a visible control can pause the looping video
 * (WCAG 2.2.2 — moving content longer than 5s must be pausable).
 */
export function GaHero() {
  const hero = gaPageCopy.hero
  const [motionAllowed, setMotionAllowed] = useState(false)
  const [paused, setPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY)
    const update = () => setMotionAllowed(!mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const togglePaused = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  return (
    <section
      aria-labelledby="ga-hero-title"
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* Illustrated paper sky — the locked v1 hero world, unchanged. */}
      <div aria-hidden className="hero-sky-bg absolute inset-0 overflow-hidden">
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[4%] left-[74%] w-[20%] mix-blend-lighten select-none"
          src="/hero/cloud-halftone.png"
        />
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[20%] -left-[6%] w-[34%] mix-blend-lighten select-none"
          src="/hero/cloud-halftone.png"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1024px] flex-1 flex-col items-center px-5 pt-36 text-center sm:px-8 sm:pt-40">
        <div className="ga-fade-up">
          <h1
            className="font-heading text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
            id="ga-hero-title"
          >
            {hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] font-body text-base leading-[1.7] text-balance text-[color:var(--paper-muted)] sm:text-lg">
            {hero.body}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              asChild
              className="h-12 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[var(--paper-shadow-cta)] transition-[background-color,translate,scale,box-shadow] duration-200 ease-out hover:-translate-y-px hover:bg-primary/90 hover:shadow-[var(--paper-shadow-cta-hover)] focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.96]"
            >
              <a href={TEACHER_WORKSPACE_APP_URL} rel="noreferrer">
                {hero.action}
              </a>
            </Button>
            <p className="font-body text-sm leading-5 text-[color:var(--paper-muted)]">
              {hero.actionNote}
            </p>
          </div>
        </div>

        {/* The teacher, slowly working. Decorative: the copy above carries
            every claim. The still frame is the settled composition; the loop
            is an enhancement for visitors who allow motion. */}
        <div className="mt-10 flex w-full flex-1 items-end justify-center sm:mt-12">
          <figure
            aria-label="A hand-drawn teacher working calmly at her desk."
            className="relative w-[min(420px,72vw)]"
          >
            {motionAllowed ? (
              <video
                aria-hidden
                autoPlay
                className="aspect-square w-full mix-blend-multiply select-none"
                height={624}
                loop
                muted
                playsInline
                poster="/hero/teacher-working-poster.webp"
                ref={videoRef}
                src="/hero/teacher-working.mp4"
                width={624}
              />
            ) : (
              <img
                alt=""
                aria-hidden
                className="w-full mix-blend-multiply select-none"
                height={624}
                src="/hero/teacher-working-poster.webp"
                width={624}
              />
            )}
            {motionAllowed ? (
              <button
                className="absolute -right-2 -bottom-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[color:var(--paper-rule-strong)] bg-[color:var(--paper-card)]/80 px-4 font-body text-sm leading-5 font-medium text-[color:var(--paper-ink)] backdrop-blur-sm transition-colors duration-200 ease-out hover:bg-[color:var(--paper-card)] focus-visible:ring-3 focus-visible:ring-primary focus-visible:outline-none sm:-right-8"
                onClick={togglePaused}
                type="button"
              >
                {paused ? "Play animation" : "Pause animation"}
              </button>
            ) : null}
          </figure>
        </div>
      </div>
    </section>
  )
}
