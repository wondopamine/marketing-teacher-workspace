import { useEffect, useRef, useState } from "react"

const HOVER_QUERY = "(hover: hover) and (pointer: fine)"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/* The trail's character. Marks land on a fixed grid — that is what makes them
   read as one field the pointer passes through rather than a swarm chasing it
   — and each one fades on its own clock, so the sky is empty again a beat
   after the pointer stops. Pitch and lifetime are deliberately slower and
   larger than a terminal-style field: this is pencil on paper, not glyphs. */
const CELL_PX = 26
const MARK_LIFE_MS = 1100
const MARK_FADE_IN_MS = 90
const MARK_MAX_ALPHA = 0.4
/** Ceiling on live marks — a fast sweep across a wide hero cannot outrun it. */
const MARK_CEILING = 180
/** Breathing room around copy: marks never crowd a line of text. */
const SAFE_PAD_PX = 14
/** Odds a mark also lands one cell off the path, loosening the band. */
const SPREAD_CHANCE = 0.3
const GLYPH_COUNT = 5
/** Only used if the token cannot be read (never in the browser). */
const FALLBACK_INK = "#1a1a1a"

type Mark = {
  x: number
  y: number
  born: number
  glyph: number
  angle: number
}

/**
 * The hero's pointer trail: small hand-drawn marks — dash, slash, dot,
 * chevron, cross — bloom on a grid where the pointer passes and fade out
 * behind it. Same mechanism as the Codex hero's character field, drawn in
 * the paper world's material instead of monospace glyphs.
 *
 * Decorative and additive by construction: a `<canvas>` that never renders on
 * the server, never mounts for `prefers-reduced-motion` or for a coarse
 * pointer (nothing to follow on touch), takes no pointer events and carries
 * no information. Elements marked `data-hero-ink-safe` are excluded from the
 * field, so copy and the illustration are never drawn over.
 */
export function GaHeroInk() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
    const finePointer = window.matchMedia(HOVER_QUERY)
    const update = () =>
      setEnabled(!reducedMotion.matches && finePointer.matches)
    update()
    reducedMotion.addEventListener("change", update)
    finePointer.addEventListener("change", update)
    return () => {
      reducedMotion.removeEventListener("change", update)
      finePointer.removeEventListener("change", update)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    const host = canvas?.closest("section")
    const ctx = canvas?.getContext("2d")
    if (!canvas || !host || !ctx) return

    const ink =
      getComputedStyle(canvas).getPropertyValue("--paper-ink").trim() ||
      FALLBACK_INK
    const marks: Array<Mark> = []
    let width = 0
    let height = 0
    let originX = 0
    let originY = 0
    /* Canvas-relative, so scrolling can never invalidate them. */
    let safeZones: Array<{
      left: number
      top: number
      right: number
      bottom: number
    }> = []
    let frame = 0
    let lastX: number | null = null
    let lastY: number | null = null

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      originX = rect.left
      originY = rect.top
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      // Resizing the backing store resets context state; reapply it.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = "round"
      ctx.lineWidth = 1.4
      ctx.strokeStyle = ink
      ctx.fillStyle = ink
      safeZones = [...host.querySelectorAll("[data-hero-ink-safe]")].map(
        (element) => {
          const box = element.getBoundingClientRect()
          return {
            left: box.left - rect.left - SAFE_PAD_PX,
            top: box.top - rect.top - SAFE_PAD_PX,
            right: box.right - rect.left + SAFE_PAD_PX,
            bottom: box.bottom - rect.top + SAFE_PAD_PX,
          }
        }
      )
    }

    /* Scroll moves the hero under the pointer but not within itself. */
    const trackOrigin = () => {
      const rect = canvas.getBoundingClientRect()
      originX = rect.left
      originY = rect.top
    }

    const drawGlyph = (glyph: number) => {
      ctx.beginPath()
      if (glyph === 0) {
        ctx.moveTo(-3.5, 0)
        ctx.lineTo(3.5, 0)
      } else if (glyph === 1) {
        ctx.moveTo(-2.5, 2.5)
        ctx.lineTo(2.5, -2.5)
      } else if (glyph === 2) {
        ctx.arc(0, 0, 1.3, 0, Math.PI * 2)
        ctx.fill()
        return
      } else if (glyph === 3) {
        ctx.moveTo(-2, -2.5)
        ctx.lineTo(1.5, 0)
        ctx.lineTo(-2, 2.5)
      } else {
        ctx.moveTo(-2.5, 0)
        ctx.lineTo(2.5, 0)
        ctx.moveTo(0, -2.5)
        ctx.lineTo(0, 2.5)
      }
      ctx.stroke()
    }

    const render = (now: number) => {
      frame = 0
      ctx.clearRect(0, 0, width, height)
      let alive = false
      for (let index = marks.length - 1; index >= 0; index -= 1) {
        const mark = marks[index]
        const age = now - mark.born
        if (age >= MARK_LIFE_MS) {
          marks.splice(index, 1)
          continue
        }
        alive = true
        const arrival = Math.min(age / MARK_FADE_IN_MS, 1)
        const remaining =
          1 -
          Math.max(age - MARK_FADE_IN_MS, 0) / (MARK_LIFE_MS - MARK_FADE_IN_MS)
        // ^1.4 rather than a square: the mark leaves at an even pace
        // instead of dropping away and then lingering at a hair's weight.
        ctx.globalAlpha = MARK_MAX_ALPHA * arrival * Math.pow(remaining, 1.4)
        ctx.save()
        ctx.translate(mark.x, mark.y)
        ctx.rotate(mark.angle)
        drawGlyph(mark.glyph)
        ctx.restore()
      }
      ctx.globalAlpha = 1
      // The loop exists only while marks do — an idle hero costs no frames.
      if (alive) frame = requestAnimationFrame(render)
    }

    const spawn = (x: number, y: number, now: number, spread: boolean) => {
      if (x < 0 || y < 0 || x > width || y > height) return
      const cellX = Math.floor(x / CELL_PX) * CELL_PX + CELL_PX / 2
      const cellY = Math.floor(y / CELL_PX) * CELL_PX + CELL_PX / 2
      const blocked = safeZones.some(
        (zone) =>
          cellX >= zone.left &&
          cellX <= zone.right &&
          cellY >= zone.top &&
          cellY <= zone.bottom
      )
      if (blocked) return
      // One mark per cell at a time: a slow pointer thickens nothing.
      if (marks.some((mark) => mark.x === cellX && mark.y === cellY)) return
      marks.push({
        x: cellX,
        y: cellY,
        born: now,
        glyph: Math.floor(Math.random() * GLYPH_COUNT),
        angle: (Math.random() - 0.5) * 0.3,
      })
      if (marks.length > MARK_CEILING) marks.shift()
      if (spread && Math.random() < SPREAD_CHANCE) {
        const stepX = Math.random() < 0.5 ? -CELL_PX : CELL_PX
        const stepY = Math.random() < 0.5 ? -CELL_PX : CELL_PX
        spawn(cellX + stepX, cellY + stepY, now, false)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      const x = event.clientX - originX
      const y = event.clientY - originY
      const now = performance.now()
      if (lastX === null || lastY === null) {
        spawn(x, y, now, true)
      } else {
        // Walk the segment so a fast sweep leaves a path, not two dots.
        const deltaX = x - lastX
        const deltaY = y - lastY
        const steps = Math.min(
          Math.max(Math.ceil(Math.hypot(deltaX, deltaY) / (CELL_PX * 0.6)), 1),
          20
        )
        for (let step = 1; step <= steps; step += 1) {
          spawn(
            lastX + (deltaX * step) / steps,
            lastY + (deltaY * step) / steps,
            now,
            true
          )
        }
      }
      lastX = x
      lastY = y
      if (!frame) frame = requestAnimationFrame(render)
    }

    /* Forget the last point on the way out, so re-entering the hero
       elsewhere does not stripe a line across it. */
    const onPointerLeave = () => {
      lastX = null
      lastY = null
    }

    measure()
    host.addEventListener("pointermove", onPointerMove)
    host.addEventListener("pointerleave", onPointerLeave)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", trackOrigin, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      host.removeEventListener("pointermove", onPointerMove)
      host.removeEventListener("pointerleave", onPointerLeave)
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", trackOrigin)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full select-none"
      ref={canvasRef}
    />
  )
}
