import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/cms/comments")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleCmsCommentsRead } =
          await import("@/server/cms-comments.handler.server")
        return handleCmsCommentsRead(request)
      },
      PATCH: async ({ request }) => {
        const { handleCmsCommentsWrite } =
          await import("@/server/cms-comments.handler.server")
        return handleCmsCommentsWrite(request)
      },
      POST: async ({ request }) => {
        const { handleCmsCommentsWrite } =
          await import("@/server/cms-comments.handler.server")
        return handleCmsCommentsWrite(request)
      },
    },
  },
})
