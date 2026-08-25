import { createMiddleware, createStart } from "@tanstack/react-start"

import { finalisePublicPageResponse } from "@/server/public-page"

const publicPageStatusMiddleware = createMiddleware().server(
  async ({ next }) => {
    const result = await next()
    const response = finalisePublicPageResponse(result.response)
    return response === result.response ? result : response
  }
)

export const startInstance = createStart(() => ({
  requestMiddleware: [publicPageStatusMiddleware],
}))
