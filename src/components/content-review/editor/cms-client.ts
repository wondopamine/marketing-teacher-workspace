import type {
  CmsReadResponse,
  CmsWriteRequest,
  CmsWriteResponse,
} from "@/cms/api"

export async function writeCms(
  request: CmsWriteRequest,
  csrfToken: string
): Promise<CmsWriteResponse> {
  const response = await fetch("/api/cms/versions", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "x-cms-csrf": csrfToken,
    },
    body: JSON.stringify(request),
  })
  return (await response.json()) as CmsWriteResponse
}

export async function readCmsHistory(
  pageId: string,
  cursor: number | null = null
): Promise<CmsReadResponse> {
  const query = new URLSearchParams({ pageId })
  if (cursor !== null) query.set("cursor", String(cursor))
  const response = await fetch(`/api/cms/versions?${query}`, {
    credentials: "same-origin",
  })
  return (await response.json()) as CmsReadResponse
}

export async function readCmsVersion(
  pageId: string,
  versionId: string
): Promise<CmsReadResponse> {
  const query = new URLSearchParams({ pageId, versionId })
  const response = await fetch(`/api/cms/versions?${query}`, {
    credentials: "same-origin",
  })
  return (await response.json()) as CmsReadResponse
}
