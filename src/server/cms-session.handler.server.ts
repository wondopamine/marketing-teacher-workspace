import "@tanstack/react-start/server-only"

import {
  CmsCapabilityError,
  clearCmsCapabilityCookieHeader,
  exchangeCmsCapability,
} from "@/auth/cms-capability.server"

const protectedHeaders = {
  "Cache-Control": "private, no-store",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  Vary: "Cookie",
} as const

export function handleCmsCapabilityExchange(request: Request): Response {
  const url = new URL(request.url)
  const keys = url.searchParams.getAll("key")
  if (
    keys.length !== 1 ||
    [...url.searchParams.keys()].some((name) => name !== "key")
  ) {
    return privateText(400, "This edit link is not valid.")
  }

  try {
    const result = exchangeCmsCapability(keys[0] ?? "", request.url)
    return new Response(null, {
      status: 303,
      headers: {
        ...protectedHeaders,
        Location: "/cms-preview",
        "Set-Cookie": result.cookieHeader,
      },
    })
  } catch (error) {
    if (error instanceof CmsCapabilityError && error.code === "INVALID_LINK") {
      return privateText(404, "This edit link is not valid.")
    }
    return privateText(404, "The editor is not available.")
  }
}

export function handleCmsCapabilityClear(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...protectedHeaders,
      "Set-Cookie": clearCmsCapabilityCookieHeader(request.url),
    },
  })
}

function privateText(status: number, message: string): Response {
  return new Response(message, {
    status,
    headers: {
      ...protectedHeaders,
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
