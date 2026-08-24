import { motion, useTransform } from "motion/react"
import { useEffect, useState } from "react"

import { gaActVignettes } from "./ga-vignettes"

import type { MotionValue } from "motion/react"
import type { ReactNode } from "react"

/**
 * The reveal's scatter field: fragments of the product and the paper world
 * drifting around the statement.
 *
 * All five pieces are anchored at the section's centre and pushed out from
 * there, so the composition reads as the page's own material coming apart
 * around the sentence that names it. Scroll drives one shared scale ramp
 * (small → settled) plus a per-piece drift vector, which is what keeps the
 * field from moving as one flat sheet.
 *
 * Transform and opacity only, and the stage clips them — nothing here can
 * reflow the page or widen it. Decorative throughout: every claim lives in
 * the statement, so the whole layer is `aria-hidden` and inert to the
 * pointer.
 */

const HolisticVignette = gaActVignettes.notice
const PostsVignette = gaActVignettes["family-and-record"]

type ScatterPiece = {
  id: string
  /** Where the piece sits when the section is centred, px from the centre. */
  settle: readonly [number, number]
  /** Total travel across the section — half before settle, half after. */
  drift: readonly [number, number]
  /** Paper things are rarely square to the page. */
  rotate: number
  width: number
  content: ReactNode
}

/**
 * The sketch and the teacher are already on the page above, so they cost
 * nothing to bring back here — and bringing them back is the point: the reveal
 * is where the hero's world and the product meet.
 */
const PIECES: ReadonlyArray<ScatterPiece> = [
  {
    id: "profile",
    settle: [-472, -178],
    drift: [-88, -240],
    rotate: -2.5,
    width: 300,
    content: <HolisticVignette animate={false} />,
  },
  {
    id: "screen",
    settle: [468, -206],
    drift: [112, -198],
    rotate: 2,
    width: 330,
    content: (
      <div className="overflow-hidden rounded-2xl shadow-[var(--paper-shadow-card)]">
        <img
          alt=""
          aria-hidden
          className="block w-full select-none"
          height={600}
          loading="lazy"
          src="/hero/profiles-screen-960.avif"
          width={960}
        />
      </div>
    ),
  },
  {
    id: "posts",
    settle: [452, 182],
    drift: [58, -262],
    rotate: -1.5,
    width: 300,
    content: <PostsVignette animate={false} />,
  },
  {
    id: "teacher",
    settle: [-452, 198],
    drift: [-118, -212],
    rotate: 2.5,
    width: 190,
    content: (
      // Framed rather than blended: an ancestor transform gives this layer its
      // own stacking context, so the hero's `mix-blend-multiply` trick cannot
      // drop the white here. A paper card is the honest alternative.
      <div className="rounded-2xl bg-[color:var(--paper-card)] p-2 shadow-[var(--paper-shadow-card)]">
        <img
          alt=""
          aria-hidden
          className="block w-full select-none"
          height={624}
          loading="lazy"
          src="/hero/teacher-working-poster.webp"
          width={624}
        />
      </div>
    ),
  },
  {
    id: "sketch",
    settle: [-204, 366],
    drift: [188, -196],
    rotate: -4,
    width: 340,
    content: (
      <img
        alt=""
        aria-hidden
        className="block w-full select-none"
        height={306}
        loading="lazy"
        src="/hero/hero-cards-sketch.svg"
        width={1019}
      />
    ),
  },
]

/** Scale at the far edge of the section, before the pieces settle. */
const ENTER_SCALE = 0.36
/** Progress at which the field is fully out and full size. */
const SETTLE_AT = 0.5

/**
 * Centring and tilt, kept in one inline transform string so they never share a
 * CSS property with the scroll-driven transform on the wrapper above.
 */
/** The widest settle offset in the field, which sets the scale below. */
const WIDEST_REACH = Math.max(
  ...PIECES.map((piece) => Math.abs(piece.settle[0]))
)

/**
 * One scale for the whole field, so a narrow viewport tightens the composition
 * instead of slicing it. The offsets were authored at 1440 and hard-clipped
 * every corner fragment from 1024 to ~1300 (design review, 2026-08-24).
 * Scaling every piece by the same factor keeps their relative spacing, which
 * clamping each piece separately would flatten. 1 at 1440 and wider, so the
 * reviewed composition is unchanged there; the 0.32 share is what clears the
 * widest fragment's own half-width at 1024.
 */
function fieldScale(viewportWidth: number) {
  if (viewportWidth === 0) return 1
  return Math.min(1, (viewportWidth * 0.32) / WIDEST_REACH)
}

function PieceBody({ piece }: { piece: ScatterPiece }) {
  return (
    <div
      style={{
        transform: `translate(-50%, -50%) rotate(${piece.rotate}deg)`,
        width: piece.width,
      }}
    >
      {piece.content}
    </div>
  )
}

function DriftingPiece({
  fieldWidthScale,
  piece,
  progress,
}: {
  /** Shrinks the whole field on narrow viewports; see `fieldScale`. */
  fieldWidthScale: number
  piece: ScatterPiece
  progress: MotionValue<number>
}) {
  const [sx, sy] = piece.settle
  const [dx, dy] = piece.drift
  const x = useTransform(
    progress,
    [0, 1],
    [
      (sx - dx * SETTLE_AT) * fieldWidthScale,
      (sx + dx * (1 - SETTLE_AT)) * fieldWidthScale,
    ]
  )
  const y = useTransform(
    progress,
    [0, 1],
    [
      (sy - dy * SETTLE_AT) * fieldWidthScale,
      (sy + dy * (1 - SETTLE_AT)) * fieldWidthScale,
    ]
  )
  const scale = useTransform(progress, [0, SETTLE_AT], [ENTER_SCALE, 1])
  // Range spans [0, 1] with `clamp: false` so motion 12 cannot lift this onto
  // its accelerated WAAPI path, where a scroll-linked opacity becomes an
  // independent animation and stops reading `progress` (same fix as
  // `paper-backdrop.tsx` and the reveal's beats).
  const opacity = useTransform(progress, [0, 0.08, 0.3, 1], [0, 0, 1, 1], {
    clamp: false,
  })

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 will-change-transform"
      style={{ opacity, scale, x, y }}
    >
      <PieceBody piece={piece} />
    </motion.div>
  )
}

export function GaRevealScatter({
  progress,
}: {
  progress: MotionValue<number>
}) {
  const [fieldWidthScale, setFieldWidthScale] = useState(1)

  useEffect(() => {
    const measure = () => setFieldWidthScale(fieldScale(window.innerWidth))
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
    >
      {PIECES.map((piece) => (
        <DriftingPiece
          fieldWidthScale={fieldWidthScale}
          key={piece.id}
          piece={piece}
          progress={progress}
        />
      ))}
    </div>
  )
}
