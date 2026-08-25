import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"

import { MastheadSg } from "./masthead-sg"

const FALLBACK_TEXT = "A Singapore Government Agency Website"
const SGDS_TAG = "sgds-masthead"

describe("MastheadSg", () => {
  it("renders the fallback masthead in the first pass", () => {
    expect(renderToStaticMarkup(<MastheadSg />)).toContain(FALLBACK_TEXT)
  })

  it("still renders the fallback when the SGDS element is already defined", () => {
    // Hydration parity: the SGDS import starts at module scope, so it can be
    // defined before React hydrates. If the first client render branched on
    // that, it would disagree with the server's markup and React would throw
    // the hydrated tree away (#418). The upgrade belongs in an effect.
    if (!customElements.get(SGDS_TAG)) {
      customElements.define(SGDS_TAG, class extends HTMLElement {})
    }
    const markup = renderToStaticMarkup(<MastheadSg />)
    expect(markup).toContain(FALLBACK_TEXT)
    expect(markup).not.toContain(`<${SGDS_TAG}`)
  })
})
