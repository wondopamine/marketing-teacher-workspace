import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/cms/versions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleCmsVersionsRead } =
          await import("@/server/cms-versions.handler.server")
        return handleCmsVersionsRead(request)
      },
      POST: async ({ request }) => {
        const { handleCmsVersionsWrite } =
          await import("@/server/cms-versions.handler.server")
        return handleCmsVersionsWrite(request)
      },
    },
  },
})
