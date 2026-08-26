import { motion, useTransform } from "motion/react"
import {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import { STILL_SIZE } from "./ga-screen-meta"

import type { GaJourneyActId } from "@/content/landing-ga-page"
import type { MotionValue } from "motion/react"

/**
 * The stills come from the screens' chunk, which the journey loads a viewport
 * before it is needed; the reveal sits between the journey's acts and the
 * audiences, so by the time a card can turn the chunk is already here.
 */
const ScreenStill = lazy(() =>
  import("./ga-screens").then((module) => ({ default: module.ScreenStill }))
)

/**
 * The reveal's scatter field: five cards drifting around the statement, one per
 * act of the journey.
 *
 * The cards carry the section's argument rather than decorating it. While the
 * first sentence holds — "the care was always yours" — every card shows a
 * teacher with their class, because that is the claim. As the statement turns
 * over to "we removed the admin between the moments", three of them turn with
 * it, staggered, to the piece of the product that act is about. The photograph
 * and the interface are the same card seen from two sides, which is the whole
 * point of the sentence pair.
 *
 * Three, not five (owner, 2026-08-25). Turning the whole field over answered
 * the sentence too completely: the teachers vanished and the reveal ended on a
 * wall of product. The two that keep their photographs are what stops the
 * second sentence from undoing the first.
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
 * the screens are drawn at rest (`ScreenStill`) so no card runs a script behind
 * the back of a card that is facing away.
 */

export type ScatterPiece = {
  /** The act this card belongs to — also the photo's filename and its back. */
  id: GaJourneyActId
  /** Where the piece sits when the section is centred, px from the centre. */
  settle: readonly [number, number]
  /** Total travel across the section — half before settle, half after. */
  drift: readonly [number, number]
  /** Paper things are rarely square to the page. */
  rotate: number
  /**
   * The card's width. On a card that turns over this is the only dimension the
   * composition gets to choose: the height comes from the component (owner,
   * 2026-08-26 — the UI sets the card's proportion and size, and the
   * photograph crops to it). A card that never turns is a print of a square
   * photograph, so its width is its height too.
   *
   * The width is also what decides how large the component is drawn, at
   * `(width - 16) / STILL_SIZE.width`. That ratio may not exceed 1: a product
   * panel drawn larger than it was authored has type and radii that belong to
   * no screen in the product. `ga-landing-page.test.tsx` holds the line.
   */
  width: number
  /**
   * Whether this card turns over to its act's interface when the statement
   * does. Three of the five do (owner, 2026-08-25): enough for the sentence
   * pair to land, while the two that stay as photographs keep the field from
   * becoming a wall of product.
   */
  flips: boolean
}

export const PIECES: ReadonlyArray<ScatterPiece> = [
  {
    // The suggested next step, in the slot the eye starts from (owner,
    // 2026-08-26: "instead of the filter, use this UI"). The filter panel used
    // to turn over here and it was the wrong thing for a card: its open
    // dropdown is absolutely positioned, so it sits outside the height the card
    // is built from and was cropped mid-row every time. The guidance card is a
    // closed, self-contained panel — it has an end, and the card can show all
    // of it. Nothing here is a capture; this is the same coded component the
    // journey's third act runs.
    id: "next-steps",
    settle: [-470, -168],
    drift: [-88, -240],
    rotate: -2.5,
    // The width the filter panel had. 400 was tried, to draw the 520px
    // guidance card at 0.738 instead of 0.645 and match the delivery
    // overview's scale — and 1280 rejected it: the taller card reached a
    // longer line of the statement and overlapped it by 19–26px, then clipped
    // 11px on the section's left edge by the end of the travel. The arithmetic
    // said 31px of room; the measurement said none. 344 measures clean at
    // every width and progress point.
    width: 344,
    flips: true,
  },
  {
    id: "notice",
    settle: [472, -182],
    drift: [112, -198],
    rotate: 2,
    // 336 before, which drew the 236px rail at 1.42× — the one component in
    // the field bigger than the product draws it. 252 is the rail at its own
    // size, and the card is the portrait its 236×300 makes.
    width: 252,
    flips: true,
  },
  {
    // The teacher who was act one, keeping her photograph: the two acts traded
    // places when the guidance card took the turning slot above.
    id: "promise",
    settle: [452, 198],
    drift: [58, -262],
    rotate: -1.5,
    width: 252,
    flips: false,
  },
  {
    id: "words",
    settle: [-452, 204],
    drift: [-118, -212],
    rotate: 2.5,
    width: 260,
    flips: false,
  },
  {
    id: "family-and-record",
    settle: [0, 300],
    // Half the rise of the others. This is the one card directly under the
    // statement, and at the full drift its top edge reached the last line of
    // the three-line sentence by the end of the section.
    drift: [120, -110],
    rotate: -3,
    width: 340,
    flips: true,
  },
]

/** Scale at the far edge of the section, before the pieces settle. */
const ENTER_SCALE = 0.36
/** Progress at which the field is fully out and full size. */
const SETTLE_AT = 0.5

/** The white margin around a card's face, matching the paper-print frame. */
const CARD_PAD = 8

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
 * A card's box, from its component.
 *
 * The component is drawn as large as the card's width allows and never larger
 * than it was authored: a product panel scaled past 1 has type, radii and
 * hairlines that belong to no screen in the product, and the profile rail was
 * being drawn at 1.4× before the card widths were read this way. The card's
 * height is then the component's own height at that scale, which is what makes
 * the card the component's shape.
 *
 * A card that keeps its photograph has no component to obey, so it stays the
 * square print it always was.
 */
export function cardFit(piece: ScatterPiece, panelHeight: number) {
  const scale = Math.min(
    1,
    (piece.width - CARD_PAD * 2) / STILL_SIZE[piece.id].width
  )
  return {
    scale,
    cardHeight: piece.flips
      ? Math.round(panelHeight * scale) + CARD_PAD * 2
      : piece.width,
  }
}

/**
 * A card, both faces.
 *
 * On a card that turns over, the component sets the shape and the photograph
 * crops to it (owner, 2026-08-26: "UIs should be priority when it comes to the
 * proportion and size of the card. Then photograph can fit to that aspect
 * ratio"). The order matters, and this is the second time it has been settled:
 * with the card sized first, the delivery overview sat in the top three
 * quarters of a square card and a quarter of that card was empty white, while
 * the profile rail left 68px of empty width and was drawn 1.4× larger than the
 * product draws it. Neither is something padding or alignment can hide.
 *
 * So the width is the composition's — it is what the settle offsets were
 * authored against — and everything else follows from the component: it is
 * drawn at `inner / STILL_SIZE.width` of its authored size, the card's height
 * is that ratio applied to the component's own height, and `object-cover` on
 * the front takes whatever crop of the square photograph that shape asks for.
 *
 * The component is rendered at its authored width and scaled from its top-left
 * corner, so it keeps the proportions it was designed at rather than reflowing
 * into a column a third of its width. `offsetHeight` reads the layout height,
 * which a transform does not touch, so the correction below is a measurement of
 * the component as authored.
 */
function PieceBody({
  piece,
  turn,
}: {
  piece: ScatterPiece
  turn: MotionValue<number>
}) {
  const still = STILL_SIZE[piece.id]
  const panelRef = useRef<HTMLDivElement | null>(null)
  // The authored height to begin with, the real one once it can be read. The
  // card's shape depends on this, and the screens arrive in a lazy chunk — a
  // card that waited for the measurement would re-crop its photograph in front
  // of the reader. `useLayoutEffect` then corrects it before any paint, so a
  // component that lays out taller than `STILL_SIZE` says is caught silently.
  const [panelHeight, setPanelHeight] = useState(still.height)

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const measure = () => setPanelHeight(panel.offsetHeight)
    measure()
    // Components are laid out text-first, so a font landing late changes the
    // height, and with it the card's shape.
    const observer = new ResizeObserver(measure)
    observer.observe(panel)
    return () => observer.disconnect()
  }, [])

  const { cardHeight, scale } = cardFit(piece, panelHeight)
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
          // The photographs are square, and a card that keeps its photograph is
          // a print of one. A card that turns is its component's shape.
          height: cardHeight,
          rotateY: piece.flips ? turn : 0,
          transformStyle: piece.flips ? "preserve-3d" : undefined,
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

        {piece.flips ? (
          <div
            // `text-left`: the reveal's stage is `text-center` and that
            // inherits straight into the card, which re-ragged the guidance
            // card's three-line paragraph down the middle. A component brings
            // its own alignment; the card must not impose one.
            className={`${face} flex [transform:rotateY(180deg)] items-center justify-center text-left`}
            style={{ padding: CARD_PAD }}
          >
            <div
              ref={panelRef}
              style={{
                transform: `scale(${scale})`,
                width: still.width,
              }}
            >
              <Suspense fallback={null}>
                <ScreenStill id={piece.id} />
              </Suspense>
            </div>
          </div>
        ) : null}
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
