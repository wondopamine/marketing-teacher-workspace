import { motion, useTransform } from "motion/react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { gaActVignettes } from "./ga-vignettes"

import type { GaJourneyActId } from "@/content/landing-ga-page"
import type { MotionValue } from "motion/react"

/**
 * The reveal's scatter field: five cards drifting around the statement, one per
 * act of the journey.
 *
 * The cards carry the section's argument rather than decorating it. While the
 * first sentence holds — "the care was always yours" — every card shows a
 * teacher with their class, because that is the claim. As the statement turns
 * over to "we removed the admin between the moments", the cards turn with it:
 * each one flips, staggered, to the piece of the product that act is about. The
 * photograph and the interface are the same card seen from two sides, which is
 * the whole point of the sentence pair.
 *
 * The pieces are anchored at the section's centre and pushed out from there, so
 * the composition reads as the page's own material coming apart around the
 * sentence that names it. Scroll drives one shared scale ramp (small →
 * settled), a per-piece drift vector — which is what keeps the field from
 * moving as one flat sheet — and the flip.
 *
 * Transform and opacity only, and the stage clips them: nothing here can reflow
 * the page or widen it. Decorative throughout — every claim lives in the
 * statement, so the whole layer is `aria-hidden` and inert to the pointer, and
 * the vignettes are handed `animate={false}` so no card runs a timer behind the
 * back of a card that is facing away.
 */

type ScatterPiece = {
  /** The act this card belongs to — also the photo's filename and its back. */
  id: GaJourneyActId
  /** Where the piece sits when the section is centred, px from the centre. */
  settle: readonly [number, number]
  /** Total travel across the section — half before settle, half after. */
  drift: readonly [number, number]
  /** Paper things are rarely square to the page. */
  rotate: number
  width: number
}

const PIECES: ReadonlyArray<ScatterPiece> = [
  {
    id: "promise",
    settle: [-470, -168],
    drift: [-88, -240],
    rotate: -2.5,
    width: 264,
  },
  {
    id: "notice",
    settle: [472, -182],
    drift: [112, -198],
    rotate: 2,
    width: 272,
  },
  {
    id: "next-steps",
    settle: [452, 198],
    drift: [58, -262],
    rotate: -1.5,
    width: 252,
  },
  {
    id: "words",
    settle: [-452, 204],
    drift: [-118, -212],
    rotate: 2.5,
    width: 260,
  },
  {
    id: "family-and-record",
    settle: [0, 322],
    drift: [120, -196],
    rotate: -3,
    width: 214,
  },
]

/** Scale at the far edge of the section, before the pieces settle. */
const ENTER_SCALE = 0.36
/** Progress at which the field is fully out and full size. */
const SETTLE_AT = 0.5

/** The white margin around a card's face, matching the paper-print frame. */
const CARD_PAD = 8

/**
 * The width the vignettes are drawn at before being scaled into a card. They
 * are authored around 300px — scaling one down keeps its proportions, where
 * letting it reflow into a 230px column would restyle it.
 */
const VIGNETTE_WIDTH = 300

/**
 * The flip, as fractions of the section's travel.
 *
 * The reveal's first sentence fades out over 0.60 → 0.72 and the second fades
 * in over 0.66 → 0.82 (`ga-reveal.tsx`), so the cards turn across that handover
 * and land face-up on the new sentence. Each card starts a beat after the one
 * before it, because five cards flipping in lockstep reads as one object.
 */
const FLIP_FROM = 0.56
const FLIP_SPAN = 0.24
const FLIP_STAGGER = 0.022

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

/**
 * A card, both faces.
 *
 * The interface sets the card's shape and the photograph is cropped to it.
 * That order matters: a panel is whatever height its content makes it, so
 * forcing one into a square leaves a band of empty card under it, and no
 * padding or alignment hides that. Measuring the panel and handing its aspect
 * ratio to the photograph puts the two faces in exactly the same box.
 *
 * The panel is rendered at `VIGNETTE_WIDTH` and scaled down from its top-left
 * corner, so it keeps the proportions it was designed at rather than reflowing
 * into a column a third of its width. `offsetHeight` reads the layout height,
 * which a transform does not touch, so the measurement is of the panel as
 * authored — and `useLayoutEffect` takes it before the first paint, so the card
 * is never briefly the wrong shape.
 */
function PieceBody({
  piece,
  turn,
}: {
  piece: ScatterPiece
  turn: MotionValue<number>
}) {
  const Vignette = gaActVignettes[piece.id]
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [panelHeight, setPanelHeight] = useState(VIGNETTE_WIDTH)

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const measure = () => setPanelHeight(panel.offsetHeight)
    measure()
    // The vignettes rest rather than animate here, so their height is stable —
    // but a font landing late is enough to change it.
    const observer = new ResizeObserver(measure)
    observer.observe(panel)
    return () => observer.disconnect()
  }, [])

  const inner = piece.width - CARD_PAD * 2
  const scale = inner / VIGNETTE_WIDTH
  const face =
    "absolute inset-0 overflow-hidden rounded-2xl bg-[color:var(--paper-card)] shadow-[var(--paper-shadow-card)] [backface-visibility:hidden]"

  return (
    <div
      style={{
        // Centring, tilt and the perspective the flip is seen through, kept in
        // one inline transform so they never share a CSS property with the
        // scroll-driven transform on the wrapper above.
        perspective: 1400,
        transform: `translate(-50%, -50%) rotate(${piece.rotate}deg)`,
        width: piece.width,
      }}
    >
      <motion.div
        className="relative"
        style={{
          // The card's own box: the panel's shape, at the card's width.
          height: panelHeight * scale + CARD_PAD * 2,
          rotateY: turn,
          transformStyle: "preserve-3d",
        }}
      >
        <div className={face} style={{ padding: CARD_PAD }}>
          {/* `block h-full`: a `<picture>` is inline, so without a definite
              height of its own the image's `h-full` has nothing to resolve
              against and the crop silently falls back to the photo's own
              aspect. */}
          <picture className="block h-full w-full">
            <source srcSet={`/reveal/${piece.id}-640.avif`} type="image/avif" />
            <img
              alt=""
              className="block h-full w-full rounded-xl object-cover"
              height={640}
              loading="lazy"
              src={`/reveal/${piece.id}-640.webp`}
              width={640}
            />
          </picture>
        </div>

        <div
          className={`${face} [transform:rotateY(180deg)]`}
          style={{ padding: CARD_PAD }}
        >
          <div
            ref={panelRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: VIGNETTE_WIDTH,
            }}
          >
            <Vignette animate={false} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function DriftingPiece({
  fieldWidthScale,
  index,
  piece,
  progress,
}: {
  /** Shrinks the whole field on narrow viewports; see `fieldScale`. */
  fieldWidthScale: number
  index: number
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
  const flipFrom = FLIP_FROM + index * FLIP_STAGGER
  const turn = useTransform(
    progress,
    [flipFrom, flipFrom + FLIP_SPAN],
    [0, 180]
  )

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 will-change-transform"
      style={{ opacity, scale, x, y }}
    >
      <PieceBody piece={piece} turn={turn} />
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
      {PIECES.map((piece, index) => (
        <DriftingPiece
          fieldWidthScale={fieldWidthScale}
          index={index}
          key={piece.id}
          piece={piece}
          progress={progress}
        />
      ))}
    </div>
  )
}
