import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { heroCopy, navItems } from "@/content/landing"

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-[110rem] px-4">
        <nav
          aria-label="Primary navigation"
          className="flex items-center rounded-2xl border border-black/5 bg-white/95 px-4 py-3 shadow-[0_8px_30px_-12px_rgb(15_23_42/0.18)] backdrop-blur-sm sm:px-6"
        >
          <a
            className="flex items-center gap-2.5 font-heading text-[color:var(--paper-ink)]"
            href="/"
          >
            <img
              alt=""
              aria-hidden
              className="size-9 select-none"
              src="/hero/tw-icon.png"
            />
            <span className="hidden text-sm leading-[1.05] font-medium sm:flex sm:flex-col">
              <span>Teacher</span>
              <span>Workspace</span>
            </span>
          </a>

          <div className="ml-auto flex items-center gap-6 sm:gap-8">
            <div className="hidden items-center gap-7 text-sm font-medium text-[color:var(--paper-ink)] lg:flex">
              {navItems.map((item) => (
                <a
                  className="transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <Button
              asChild
              className="h-10 rounded-full border-primary/40 px-5 text-primary hover:bg-primary/5"
              variant="outline"
            >
              <a href={heroCopy.ctaHref} rel="noreferrer">
                {heroCopy.cta}
                <ArrowRightIcon data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
