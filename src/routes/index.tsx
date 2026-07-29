import { createFileRoute } from "@tanstack/react-router"

import { SiteFooter } from "@/components/landing/footer"
import { ScrollChoreography } from "@/components/landing/scroll-choreography/scroll-choreography"

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    links: [
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        href: "/hero/hero-bg.avif",
        fetchPriority: "high",
      },
    ],
  }),
})

function HomePage() {
  return (
    <>
      <main id="main" className="paper-page">
        <ScrollChoreography />
      </main>
      <SiteFooter />
    </>
  )
}
