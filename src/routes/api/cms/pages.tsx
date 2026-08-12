import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/cms/pages")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleCmsPagesRead } =
          await import("@/server/cms-pages.handler.server")
        return handleCmsPagesRead(request)
      },
      POST: async ({ request }) => {
        const { handleCmsPagesWrite } =
          await import("@/server/cms-pages.handler.server")
        return handleCmsPagesWrite(request)
      },
    },
  },
})
