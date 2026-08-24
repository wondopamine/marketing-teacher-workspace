/*
 * Hand-drawn capability glyphs, baked from the tf(x) Icon Generator
 * (https://github.com/wondopamine/icon-generator) — Lucide shapes under the
 * "Ink" preset, in the generator's own `filter` render mode: rough.js bakes a
 * light wobble into the path data, then feTurbulence + feDisplacementMap gives
 * the stroke its grainy, eroded edge. That pair *is* the Ink icon; it is what
 * /tune previews and what the export panel rasterises.
 *
 * These were previously taken from the generator's `portable` mode, which
 * drops the filter and compensates with ~2× the rough.js roughness and bowing.
 * Portable exists for viewers that can't execute SVG filters (Figma, Finder
 * Quick Look, email); a browser is not one of those, so all it bought us was a
 * visibly wobblier icon than the tool draws. The filter is cheap here — four
 * decorative 40px glyphs, painted once, never transformed — so it stays.
 *
 * Derived from Lucide (https://lucide.dev) — ISC licence, plus MIT for icons
 * derived from Feather. Keep this notice with the file. Full text:
 * https://github.com/wondopamine/icon-generator/blob/main/NOTICE.md
 *
 * Regenerate rather than hand-edit: both the wobble and the noise field are
 * seeded from hash(lucideId + preset), so a re-export reproduces these exactly.
 */

type CapabilityGlyph = {
  /** Upstream Lucide icon id, so a re-export can be reproduced. */
  lucideId: string
  /** hash(lucideId + "Ink") — seeds the rough.js bake and the noise field. */
  seed: number
  paths: Array<string>
}

const CAPABILITY_GLYPHS = {
  "student-insights": {
    lucideId: "user-search",
    seed: 1891470923,
    paths: [
      "M6.00 7.00 C6.21 10.21 9.57 11.96 11.90 10.18 M12.00 10.46 C12.95 9.49 13.80 8.73 14.03 7.31 M14.00 7.00 C14.16 3.59 11.02 1.71 7.70 3.71 M8.00 3.54 C6.98 4.55 5.89 5.69 6.32 6.84 M6.00 7.00 C6.00 7.00 6.00 7.00 6.00 7.00",
      "M10.32 15.04 C9.39 15.01 8.55 14.95 6.96 14.97 M7.00 15.00 C4.96 15.16 2.67 17.14 3.30 18.70 M3.02 19.03 C2.99 19.45 3.02 19.86 2.99 21.02",
      "M14.00 17.00 C14.21 19.44 16.74 20.71 18.40 19.32 M18.50 19.60 C19.14 18.80 19.80 18.37 20.03 17.31 M20.00 17.00 C20.16 14.36 17.85 12.96 15.20 14.57 M15.50 14.40 C14.79 15.24 13.89 16.04 14.32 16.84 M14.00 17.00 C14.00 17.00 14.00 17.00 14.00 17.00",
      "M21.02 21.03 C20.48 20.49 20.01 19.93 19.07 19.07",
    ],
  },
  "next-step": {
    lucideId: "sparkles",
    seed: 213977268,
    paths: [
      "M11.02 2.81 C11.40 2.15 12.28 1.80 12.84 1.91 M12.65 2.24 C12.66 2.66 13.11 2.53 12.69 2.67 M13.03 2.77 C13.25 4.51 13.62 6.45 14.12 8.36 M14.03 8.37 C14.52 9.20 14.47 9.94 15.84 9.67 M15.63 10.02 C16.85 10.23 18.17 10.45 21.15 11.09 M21.19 11.02 C22.29 11.30 22.28 11.98 22.00 12.70 M21.76 12.65 C21.87 13.11 21.65 12.92 21.28 12.70 M21.20 13.06 C19.94 13.23 18.59 13.48 15.73 14.04 M15.63 14.03 C14.95 13.95 13.87 14.59 13.71 15.80 M14.07 15.66 C13.66 17.64 13.21 19.51 12.98 21.14 M12.98 21.19 C12.97 21.93 12.29 22.36 11.39 21.55 M11.35 21.76 C11.28 21.50 10.96 21.15 11.00 21.03 M11.10 21.23 C10.66 19.28 10.34 17.38 9.88 15.67 M9.97 15.63 C10.10 14.84 8.88 14.38 8.37 13.77 M8.40 14.10 C7.32 13.75 6.15 13.56 2.81 13.03 M2.81 12.98 C1.97 12.88 1.79 11.61 2.29 11.30 M2.24 11.35 C2.54 10.92 2.45 11.08 3.06 11.13 M2.73 10.99 C4.07 10.73 5.55 10.53 8.46 9.90 M8.37 9.97 C9.23 9.87 9.55 9.00 10.31 8.26 M10.06 8.43 C10.24 7.24 10.34 6.13 11.03 2.73",
      "M20.02 2.04 C20.01 3.35 19.97 4.79 20.05 6.03",
      "M22.02 4.04 C20.60 3.94 19.14 3.97 18.05 4.03",
      "M2.00 20.00 C2.24 21.63 3.88 22.56 5.19 21.41 M5.00 21.73 C5.45 21.64 6.17 20.66 5.71 19.85 M6.00 20.00 C5.98 18.63 4.17 17.27 3.07 18.04 M3.00 18.27 C2.65 18.95 1.96 19.50 1.70 19.89 M2.00 20.00 C2.00 20.00 2.00 20.00 2.00 20.00",
    ],
  },
  "message-drafting": {
    lucideId: "pen-line",
    seed: 3612733703,
    paths: [
      "M13.14 20.94 C15.88 21.02 18.67 21.04 21.14 21.04",
      "M21.17 6.81 C22.79 5.62 21.85 2.67 20.12 1.77 M19.91 2.10 C19.05 2.18 17.99 2.14 17.23 2.62 M17.29 3.06 C13.52 6.28 10.30 9.87 3.79 16.11 M3.84 16.17 C3.28 16.15 3.65 16.72 3.66 16.81 M3.39 16.98 C2.99 17.85 2.84 18.76 2.05 21.28 M2.02 21.36 C1.66 21.60 2.06 21.97 2.69 21.86 M2.62 21.99 C2.93 21.84 2.62 21.97 2.77 21.67 M2.62 21.91 C4.14 21.47 5.67 21.01 6.96 20.64 M7.00 20.66 C7.38 20.55 7.88 20.47 7.57 20.21 M8.15 20.36 C13.23 14.93 18.01 10.01 21.42 7.08",
    ],
  },
  posts: {
    lucideId: "send",
    seed: 1567585837,
    paths: [
      "M14.54 21.69 C14.92 21.90 15.46 21.84 15.10 21.57 M15.39 21.81 C15.20 21.79 15.63 21.56 15.60 21.66 M15.43 21.78 C17.60 14.87 20.01 7.78 22.32 2.61 M21.97 2.66 C22.23 2.39 21.82 2.02 21.33 2.09 M21.42 2.01 C21.61 2.01 21.42 1.88 21.20 1.69 M21.45 2.25 C14.39 4.56 7.81 6.75 2.65 8.70 M2.34 8.53 C2.13 8.36 1.72 9.44 2.45 9.09 M2.17 9.38 C2.37 9.09 2.49 9.50 2.45 9.18 M2.29 9.47 C4.76 10.40 7.03 11.41 10.23 12.55 M10.24 12.64 C10.67 13.06 11.07 13.06 11.30 14.10 M11.27 13.78 C12.65 16.80 13.97 19.82 14.53 21.62",
      "M21.75 2.38 C19.24 4.64 17.06 6.76 10.93 13.22",
    ],
  },
} satisfies Record<string, CapabilityGlyph>

type CapabilityGlyphId = keyof typeof CAPABILITY_GLYPHS

/** The Ink preset's stroke and edge-texture settings, copied from the tool. */
const INK = {
  strokeWidth: 1.4,
  /** Higher = finer grain. */
  baseFrequency: 0.85,
  numOctaves: 2,
  /** Edge wobble, in viewBox units, so the grain scales with the glyph. */
  displacementScale: 0.35,
} as const

/**
 * Draws one capability's hand-drawn glyph. Decorative: the capability name
 * sits directly beneath it, so the glyph carries no label of its own.
 */
export function GaCapabilityGlyph({
  className,
  copyId,
}: {
  className?: string
  copyId: string
}) {
  // The capability ids come from the copy source, so an unknown one means the
  // copy moved ahead of the artwork: draw nothing rather than a wrong glyph.
  if (!(copyId in CAPABILITY_GLYPHS)) return null
  const glyph = CAPABILITY_GLYPHS[copyId as CapabilityGlyphId]
  // Same id the generator emits, so an export can be traced back to its source.
  const filterId = `brush-${glyph.lucideId}-ink-${glyph.seed}`
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Widened region so the displaced edge pixels aren't clipped. */}
        <filter height="130%" id={filterId} width="130%" x="-15%" y="-15%">
          <feTurbulence
            baseFrequency={INK.baseFrequency}
            numOctaves={INK.numOctaves}
            result="noise"
            seed={glyph.seed}
            type="fractalNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={INK.displacementScale}
          />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        {glyph.paths.map((d) => (
          <path
            d={d}
            key={d}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={INK.strokeWidth}
          />
        ))}
      </g>
    </svg>
  )
}
