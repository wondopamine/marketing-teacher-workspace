import { useId } from "react"

import { LATTICE_DOT, LATTICE_STEP, SG_MAP } from "./ga-singapore-map"

import { cn } from "@/lib/utils"

/** The dots' colour (owner, 2026-08-25) — a hair off the paper ground. */
const LATTICE_INK = "#F0F0F3"

/**
 * Singapore as a lattice of dots, under the Real schools testimonials.
 *
 * Static decoration, and nothing more: one tone, one dot size, no state, no
 * effects, no pointer, and the same markup on the server as in the browser. It
 * is a drawing of the country the quotes come from.
 *
 * The dots are an SVG `<pattern>` filled into the region of grid cells that
 * fall on land (`SG_MAP.latticeRegion`) — cells, not the coastline. A pattern
 * is clipped by the shape it fills, so filling the coastline turned every
 * coastal dot into a crescent and the island read as a masked photograph of a
 * grid. Filling whole cells cannot cut a dot: each cell is exactly one tile
 * with the dot centred and clearance on every side, so the coastline is which
 * dots exist rather than where a mask falls.
 *
 * The section's words carry every claim, so the drawing is `aria-hidden`.
 */
export function GaSchoolsMap({ className }: { className?: string }) {
  const patternId = useId()

  return (
    <svg
      aria-hidden
      className={cn("block h-auto w-full select-none", className)}
      viewBox={SG_MAP.viewBox}
    >
      <defs>
        <pattern
          height={LATTICE_STEP}
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={LATTICE_STEP}
        >
          <circle
            cx={LATTICE_STEP / 2}
            cy={LATTICE_STEP / 2}
            fill={LATTICE_INK}
            r={LATTICE_DOT}
          />
        </pattern>
      </defs>

      <path d={SG_MAP.latticeRegion} fill={`url(#${patternId})`} />
    </svg>
  )
}
