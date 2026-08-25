import "@tanstack/react-start/server-only"

export const contentSources = ["static", "cms"] as const
export type ContentSource = (typeof contentSources)[number]

export function parseContentSource(value: string | undefined): ContentSource {
  if (value === undefined || value === "" || value === "static") {
    return "static"
  }
  if (value === "cms") return value
  throw new Error('CONTENT_SOURCE must be either "static" or "cms"')
}

export function getContentSource(): ContentSource {
  return parseContentSource(process.env.CONTENT_SOURCE)
}
