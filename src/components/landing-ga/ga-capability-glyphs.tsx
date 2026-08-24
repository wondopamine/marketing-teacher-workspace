/*
 * Hand-drawn capability glyphs, baked from the tf(x) Icon Generator
 * (https://github.com/wondopamine/icon-generator) — Lucide shapes distorted
 * by rough.js under the "Ink" preset, exported in its portable mode so the
 * character lives in the path data itself and no feTurbulence filter has to
 * paint at runtime (the performance floor in CLAUDE.md).
 *
 * Derived from Lucide (https://lucide.dev) — ISC licence, plus MIT for icons
 * derived from Feather. Keep this notice with the file. Full text:
 * https://github.com/wondopamine/icon-generator/blob/main/NOTICE.md
 *
 * Regenerate rather than hand-edit: the wobble is seeded from
 * hash(lucideId + preset), so a re-export reproduces these paths exactly.
 */

type CapabilityGlyph = {
  /** Upstream Lucide icon id, so a re-export can be reproduced. */
  lucideId: string
  paths: Array<string>
}

const CAPABILITY_GLYPHS = {
  "student-insights": {
    lucideId: "user-search",
    paths: [
      "M6.00 7.00 C6.41 10.33 9.80 11.92 11.81 9.92 M12.00 10.46 C12.68 9.25 13.62 9.02 14.06 7.59 M14.00 7.00 C14.31 3.29 11.35 1.43 7.42 3.87 M8.00 3.54 C7.19 4.84 5.78 5.79 6.62 6.68 M6.00 7.00 C6.00 7.00 6.00 7.00 6.00 7.00",
      "M10.34 15.08 C9.39 15.01 8.60 14.91 6.92 14.94 M7.00 15.00 C5.12 15.31 2.36 17.48 3.59 18.42 M3.04 19.06 C2.98 19.46 3.05 19.84 2.99 21.05",
      "M14.00 17.00 C14.41 19.56 16.97 20.67 18.31 19.05 M18.50 19.60 C18.87 18.56 19.62 18.66 20.06 17.59 M20.00 17.00 C20.31 14.05 18.18 12.68 14.92 14.73 M15.50 14.40 C15.00 15.52 13.78 16.15 14.62 16.68 M14.00 17.00 C14.00 17.00 14.00 17.00 14.00 17.00",
      "M21.03 21.06 C20.47 20.49 20.05 19.89 19.03 19.05",
    ],
  },
  "next-step": {
    lucideId: "sparkles",
    paths: [
      "M11.02 2.81 C11.63 2.23 12.47 1.86 13.02 1.61 M12.65 2.24 C12.50 2.91 13.27 2.48 12.41 2.53 M13.07 2.72 C13.18 4.43 13.59 6.52 14.21 8.35 M14.03 8.37 C14.84 9.22 14.15 10.05 16.04 9.39 M15.63 10.07 C16.81 10.25 18.18 10.46 21.12 11.15 M21.19 11.02 C22.62 11.43 22.29 11.90 22.22 12.75 M21.76 12.65 C22.11 13.38 21.88 12.90 21.37 12.44 M21.21 13.14 C19.99 13.22 18.60 13.48 15.82 14.04 M15.63 14.03 C15.07 13.72 13.58 14.38 13.41 15.96 M14.11 15.69 C13.66 17.68 13.15 19.43 12.97 21.10 M12.98 21.19 C13.08 21.91 12.63 22.45 11.43 21.35 M11.35 21.76 C11.37 21.38 10.87 20.91 10.99 20.88 M11.17 21.28 C10.67 19.34 10.39 17.47 9.80 15.70 M9.97 15.63 C10.37 14.85 8.59 14.55 8.37 13.51 M8.43 14.17 C7.39 13.68 6.18 13.52 2.81 13.08 M2.81 12.98 C1.88 12.92 1.84 11.30 2.34 11.25 M2.24 11.35 C2.69 10.69 2.32 11.10 3.30 11.23 M2.66 10.97 C3.98 10.70 5.59 10.55 8.54 9.83 M8.37 9.97 C9.28 9.93 9.31 8.82 10.64 8.16 M10.14 8.49 C10.29 7.24 10.29 6.18 11.05 2.64",
      "M20.03 2.08 C20.02 3.30 19.93 4.76 20.11 6.07",
      "M22.03 4.08 C20.61 3.89 19.11 3.94 18.11 4.07",
      "M2.00 20.00 C2.47 21.71 4.07 22.62 5.37 21.10 M5.00 21.73 C5.30 21.90 6.33 20.61 5.43 19.71 M6.00 20.00 C5.96 18.78 4.02 17.05 3.14 17.82 M3.00 18.27 C2.91 19.25 1.91 19.69 1.41 19.78 M2.00 20.00 C2.00 20.00 2.00 20.00 2.00 20.00",
    ],
  },
  "message-drafting": {
    lucideId: "pen-line",
    paths: [
      "M13.27 20.88 C15.89 21.03 18.59 21.08 21.27 21.07",
      "M21.17 6.81 C22.86 5.95 21.70 2.69 20.33 1.46 M19.91 2.10 C19.15 2.50 18.08 2.16 17.27 2.42 M17.40 3.28 C13.25 6.35 10.19 10.12 3.74 16.05 M3.84 16.17 C2.97 15.92 3.85 16.75 3.96 16.63 M3.43 16.95 C2.92 17.78 2.88 18.69 2.07 21.21 M2.02 21.36 C1.42 21.48 1.88 21.88 2.77 21.74 M2.62 21.99 C3.22 21.70 2.61 21.97 2.90 21.38 M2.59 21.85 C4.13 21.42 5.66 20.96 6.93 20.62 M7.00 20.66 C7.44 20.54 8.15 20.55 7.33 20.26 M8.46 20.56 C13.41 14.90 17.80 10.26 21.66 7.34",
    ],
  },
  posts: {
    lucideId: "send",
    paths: [
      "M14.54 21.69 C15.15 21.77 15.74 21.58 14.83 21.35 M15.39 21.81 C14.98 21.81 15.79 21.41 15.71 21.67 M15.39 21.89 C17.37 15.05 19.79 7.88 22.64 2.55 M21.97 2.66 C22.35 2.48 21.84 2.10 21.25 2.17 M21.42 2.01 C21.82 2.01 21.48 1.76 21.07 1.37 M21.55 2.46 C14.14 4.78 7.64 6.88 2.94 8.87 M2.34 8.53 C2.27 8.08 1.57 9.74 2.72 8.82 M2.17 9.38 C2.52 8.78 2.71 9.55 2.57 8.91 M2.27 9.47 C4.79 10.38 6.94 11.42 10.22 12.45 M10.24 12.64 C10.59 13.25 10.99 12.87 11.24 14.42 M11.20 13.81 C12.70 16.76 14.09 19.70 14.52 21.55",
      "M21.64 2.60 C19.03 4.74 17.05 6.60 10.95 13.35",
    ],
  },
} satisfies Record<string, CapabilityGlyph>

type CapabilityGlyphId = keyof typeof CAPABILITY_GLYPHS

/** Matches the stroke width the Ink preset baked the paths at. */
const GLYPH_STROKE_WIDTH = 1.4

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
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {glyph.paths.map((d) => (
        <path
          d={d}
          key={d}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={GLYPH_STROKE_WIDTH}
        />
      ))}
    </svg>
  )
}
