import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/cms/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleCmsCapabilityExchange } =
          await import("@/server/cms-session.handler.server")
        return handleCmsCapabilityExchange(request)
      },
      DELETE: async ({ request }) => {
        const { handleCmsCapabilityClear } =
          await import("@/server/cms-session.handler.server")
        return handleCmsCapabilityClear(request)
      },
    },
  },
})
