import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { EditableCopy } from "./editable-copy"

function EditableCopyHarness() {
  const [value, setValue] = useState("Original heading")
  return (
    <>
      <EditableCopy
        as="h1"
        value={value}
        label="Edit heading"
        onChange={setValue}
      />
      <button type="button" onClick={() => setValue("Restored heading")}>
        Undo
      </button>
    </>
  )
}

describe("EditableCopy", () => {
  it("does not append React's old text after a browser replaces the content", () => {
    render(<EditableCopyHarness />)
    const editable = screen.getByRole("textbox", { name: "Edit heading" })

    editable.textContent = "Replacement heading"
    fireEvent.input(editable)
    expect(editable.textContent).toBe("Replacement heading")

    fireEvent.click(screen.getByRole("button", { name: "Undo" }))
    expect(editable.textContent).toBe("Restored heading")
  })
})
