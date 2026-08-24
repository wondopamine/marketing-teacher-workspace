import { useEffect, useRef, useState } from "react"

const HOVER_QUERY = "(hover: hover) and (pointer: fine)"
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/* The field's character, measured off the reference the user filmed rather
   than guessed: the glyphs sit on a fixed ~11×12px character cell, so the
   trail reads as a field of type the pointer passes through rather than a
   swarm of ticks chasing it. */
const CELL_PX = 12
const GLYPH_PX = 13
/** Tile drawn per cell; wider than the cell so `_` and `0` cannot clip. */
const TILE_PX = 22
/**
 * Light → heavy. A cell's glyph is chosen by how bright the cell currently
 * is, so one trail decays *through* the ramp — dense `0` and `o` under the
 * pointer, dashes and underscores left behind it. That ramp is what makes the
 * reference read as ASCII rather than as scattered dots.
 */
const GLYPH_RAMP = ["_", "-", ">", "o", "0"]
/** How long a cell at full brightness takes to fade out entirely. */
const TRAIL_LIFE_MS = 2600
/** Band radius in cells: the reference's trail is 4–6 cells across. */
const BRUSH_CELLS = 2
/** Deposit per painted step. Cells only saturate where the pointer lingers. */
const PAINT_STRENGTH = 0.6
/** Ceiling on live cells — a fast sweep across a wide hero cannot outrun it. */
const CELL_CEILING = 900
/* White, and pushed hard, because the sky it lands on is already pale: the
   reference's field sat on a mid-tone lavender where white read at half
   strength. Above roughly the middle of this hero the marks tell; below it the
   sky is within a few values of white and they fade out on their own. */
const MIN_ALPHA = 0.32
const MAX_ALPHA = 0.95
/** Cells are keyed as one number; no hero is 4096 cells (49k px) wide. */
const KEY_STRIDE = 4096
const MONO_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
/** Light on the sky, not a themed colour — decoration, not a surface. */
const MARK_COLOUR = "#ffffff"

type Cell = {
  cx: number
  cy: number
  /** 0–1. Drives both the alpha and which glyph the cell shows. */
  level: number
  /** Nudges this cell's place on the ramp, so a flat patch is not uniform. */
  seed: number
}

/**
 * The hero's pointer trail: white ASCII characters bloom on a fixed grid where
 * the pointer passes and decay through a density ramp behind it.
 *
 * The field is *occluded*, never cleared. The canvas sits in the sky layer, so
 * the copy, the CTA and the illustration paint over it and cut it to their own
 * shapes — the way the reference behaves at the edge of its button. Carving
 * padded rectangles out of the field instead (the first port did) left holes
 * around the text that read as damage rather than as depth.
 *
 * Decorative and additive by construction: a `<canvas>` that never renders on
 * the server, never mounts for `prefers-reduced-motion` or for a coarse
 * pointer (nothing to follow on touch), takes no pointer events and carries
 * no information.
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

    /** cell key → cell. Insertion order doubles as oldest-first for eviction. */
    const cells = new Map<number, Cell>()
    let width = 0
    let height = 0
    let originX = 0
    let originY = 0
    let maxCx = 0
    let maxCy = 0
    let frame = 0
    let lastFrameAt = 0
    let lastX: number | null = null
    let lastY: number | null = null
    /** One glyph strip, rendered once per resize and blitted per cell. */
    let atlas: HTMLCanvasElement | null = null
    let atlasTile = 0

    /* Pre-rendering the ramp means a frame is N blits rather than N text
       layouts — the difference between a free effect and a measurable one. */
    const buildAtlas = (dpr: number) => {
      const tile = Math.ceil(TILE_PX * dpr)
      const strip = document.createElement("canvas")
      strip.width = tile * GLYPH_RAMP.length
      strip.height = tile
      const stripCtx = strip.getContext("2d")
      if (!stripCtx) return
      stripCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stripCtx.fillStyle = MARK_COLOUR
      stripCtx.font = `${GLYPH_PX}px ${MONO_STACK}`
      stripCtx.textAlign = "center"
      stripCtx.textBaseline = "middle"
      GLYPH_RAMP.forEach((glyph, index) => {
        stripCtx.fillText(glyph, index * TILE_PX + TILE_PX / 2, TILE_PX / 2)
      })
      atlas = strip
      atlasTile = tile
    }

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      originX = rect.left
      originY = rect.top
      width = rect.width
      height = rect.height
      maxCx = Math.floor(width / CELL_PX)
      maxCy = Math.floor(height / CELL_PX)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      // Resizing the backing store resets context state; reapply it.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildAtlas(dpr)
    }

    /* Scroll moves the hero under the pointer but not within itself. */
    const trackOrigin = () => {
      const rect = canvas.getBoundingClientRect()
      originX = rect.left
      originY = rect.top
    }

    const render = (now: number) => {
      frame = 0
      const elapsed = lastFrameAt ? Math.min(now - lastFrameAt, 120) : 16
      lastFrameAt = now
      ctx.clearRect(0, 0, width, height)
      const strip = atlas
      for (const [key, cell] of cells) {
        cell.level -= elapsed / TRAIL_LIFE_MS
        if (cell.level <= 0) {
          cells.delete(key)
          continue
        }
        if (!strip) continue
        const level = Math.min(cell.level, 1)
        const rampIndex = Math.min(
          Math.max(Math.floor(level * GLYPH_RAMP.length) + cell.seed, 0),
          GLYPH_RAMP.length - 1
        )
        ctx.globalAlpha = MIN_ALPHA + (MAX_ALPHA - MIN_ALPHA) * level
        ctx.drawImage(
          strip,
          rampIndex * atlasTile,
          0,
          atlasTile,
          atlasTile,
          cell.cx * CELL_PX + CELL_PX / 2 - TILE_PX / 2,
          cell.cy * CELL_PX + CELL_PX / 2 - TILE_PX / 2,
          TILE_PX,
          TILE_PX
        )
      }
      ctx.globalAlpha = 1
      // The loop exists only while cells do — an idle hero costs no frames.
      if (cells.size) frame = requestAnimationFrame(render)
      else lastFrameAt = 0
    }

    /* Paints the band around one point of the pointer's path. Cells
       accumulate, so lingering saturates a patch while a sweep only tints
       it — the same difference the reference shows between a pause and a
       flick. */
    const paint = (x: number, y: number) => {
      const centreCx = Math.floor(x / CELL_PX)
      const centreCy = Math.floor(y / CELL_PX)
      for (let dy = -BRUSH_CELLS; dy <= BRUSH_CELLS; dy += 1) {
        for (let dx = -BRUSH_CELLS; dx <= BRUSH_CELLS; dx += 1) {
          const distance = Math.hypot(dx, dy)
          if (distance > BRUSH_CELLS + 0.4) continue
          const cx = centreCx + dx
          const cy = centreCy + dy
          if (cx < 0 || cy < 0 || cx > maxCx || cy > maxCy) continue
          const falloff = 1 - distance / (BRUSH_CELLS + 1)
          // A ragged edge rather than a clean disc: the band's outline is the
          // part that would otherwise look machine-drawn.
          const gain = PAINT_STRENGTH * falloff * (0.45 + Math.random() * 0.55)
          if (gain <= 0.02) continue
          const key = cy * KEY_STRIDE + cx
          const existing = cells.get(key)
          if (existing) {
            existing.level = Math.min(existing.level + gain, 1)
            continue
          }
          cells.set(key, {
            cx,
            cy,
            level: Math.min(gain, 1),
            seed: [-1, 0, 0, 1][Math.floor(Math.random() * 4)],
          })
        }
      }
      while (cells.size > CELL_CEILING) {
        const oldest = cells.keys().next().value
        if (oldest === undefined) break
        cells.delete(oldest)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      const x = event.clientX - originX
      const y = event.clientY - originY
      if (lastX === null || lastY === null) {
        paint(x, y)
      } else {
        // Walk the segment so a fast sweep leaves a path, not two blots.
        const deltaX = x - lastX
        const deltaY = y - lastY
        const steps = Math.min(
          Math.max(Math.ceil(Math.hypot(deltaX, deltaY) / (CELL_PX * 0.75)), 1),
          96
        )
        for (let step = 1; step <= steps; step += 1) {
          paint(
            lastX + (deltaX * step) / steps,
            lastY + (deltaY * step) / steps
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
