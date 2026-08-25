import { createServerFn } from "@tanstack/react-start"

/**
 * The two calls the public review layer makes: fetch the map of editable copy,
 * and submit a round of edits and comments. Both are reachable without a login
 * by design — the page they serve is a shared review artifact.
 */

export const getReviewSpans = createServerFn({ method: "GET" }).handler(
  async () => {
    const { editableSpans } = await import("../content/mdx-raw")
    const { readGitHubConfig } = await import("./review-github")
    return {
      spans: editableSpans(),
      // Lets the client say "your edits reach the designer" or "copy them
      // manually" instead of failing only once someone presses Send.
      canSubmit: readGitHubConfig(process.env) !== null,
    }
  }
)

export const submitReviewFeedback = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { readGitHubConfig, submitToGitHub, validateSubmission } =
      await import("./review-github")

    const validated = validateSubmission(data)
    if (!validated.ok) {
      return { ok: false as const, reason: validated.reason }
    }

    const config = readGitHubConfig(process.env)
    if (!config) {
      return {
        ok: false as const,
        reason:
          "Sending isn't switched on for this deployment. Copy your notes and send them to the designer.",
      }
    }

    try {
      return await submitToGitHub(validated.submission, config)
    } catch {
      return {
        ok: false as const,
        reason: "Something went wrong sending that. Please try again.",
      }
    }
  })
