import { describe, expect, it } from "vitest"

import { PIECES, cardFit } from "./ga-reveal-scatter"
import { STILL_SIZE } from "./ga-screen-meta"

/**
 * The order the reveal's cards are sized in, which has now been settled twice.
 *
 * The card was the photograph's shape first, with the component fitted inside
 * it, and that left the delivery overview in the top three quarters of a square
 * card — a quarter of it empty white — and the profile rail 68px short of its
 * card's width while being drawn 1.4× larger than the product draws it. The
 * owner's call on 2026-08-26: "UIs should be priority when it comes to the
 * proportion and size of the card. Then photograph can fit to that aspect
 * ratio." These hold that order, so a later width edit cannot quietly undo it.
 */
describe("the reveal's cards take their shape from the component", () => {
  const flipping = PIECES.filter((piece) => piece.flips)
  const still = PIECES.filter((piece) => !piece.flips)

  it("turns three cards over and keeps two as photographs", () => {
    // Three, not five (owner, 2026-08-25): the two that keep their photographs
    // are what stops the second sentence from undoing the first.
    expect(flipping).toHaveLength(3)
    expect(still).toHaveLength(2)
  })

  it("never draws a component larger than it was authored", () => {
    // A panel scaled past 1 has type, radii and hairlines that belong to no
    // screen in the product. This is the rule the 336px `notice` card broke.
    for (const piece of flipping) {
      const { scale } = cardFit(piece, STILL_SIZE[piece.id].height)
      expect(scale).toBeLessThanOrEqual(1)
      expect(scale).toBeGreaterThan(0.4)
    }
  })

  it("gives a turning card the proportions of its component", () => {
    for (const piece of flipping) {
      const nat = STILL_SIZE[piece.id]
      const { cardHeight, scale } = cardFit(piece, nat.height)
      // The component fills the card's inner box on both axes: its drawn width
      // is the inner width, and the card's height is its drawn height. Any
      // slack on either axis is the empty card this ordering exists to remove.
      expect(cardHeight - 16).toBe(Math.round(nat.height * scale))
      const cardRatio = cardHeight / piece.width
      const componentRatio =
        (nat.height * scale + 16) / (nat.width * scale + 16)
      expect(cardRatio).toBeCloseTo(componentRatio, 1)
    }
  })

  it("keeps a card that never turns square", () => {
    for (const piece of still) {
      // The photograph is square and this card is a print of one, so the
      // measured panel height cannot change its shape.
      expect(cardFit(piece, 999).cardHeight).toBe(piece.width)
    }
  })

  it("holds the delivery overview to a band and the profile to a portrait", () => {
    // The two shapes the owner was looking at when they made the call, pinned
    // as numbers so a future width edit has to face them.
    const post = PIECES.find((piece) => piece.id === "family-and-record")
    const profile = PIECES.find((piece) => piece.id === "notice")
    expect(
      post && cardFit(post, STILL_SIZE["family-and-record"].height)
    ).toEqual({ cardHeight: 171, scale: 324 / 440 })
    expect(profile && cardFit(profile, STILL_SIZE.notice.height)).toEqual({
      cardHeight: 316,
      scale: 1,
    })
  })
})
