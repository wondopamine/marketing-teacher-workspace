import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { Suspense, lazy } from "react"

import appCss from "../styles.css?url"
import { SkipLink } from "@/components/landing/skip-link"
import { MastheadSg } from "@/components/landing/masthead-sg"
import { PublicPageMessage } from "@/components/public/public-page-message"

const DirectEdit = lazy(() =>
  import('made-refine').then((m) => ({ default: m.DirectEdit }))
)

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Teacher Workspace. Every student. One View.",
      },
      {
        name: "description",
        content:
          "The whole child on a single profile. Built with educators, for educators.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-96x96.png",
        sizes: "96x96",
      },
      {
        rel: "shortcut icon",
        href: "/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
  }),
  notFoundComponent: () => (
    <PublicPageMessage
      heading="Page not found"
      action={{ href: "/", label: "Go to homepage" }}
    >
      The requested page could not be found.
    </PublicPageMessage>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <SkipLink />
        <MastheadSg />
        {children}
        <Scripts />
        {import.meta.env.DEV && typeof window !== 'undefined' && (
          <Suspense>
            <DirectEdit />
          </Suspense>
        )}
      </body>
    </html>
  )
}
