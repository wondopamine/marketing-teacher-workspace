import { RevealOnScroll } from "@/components/landing/reveal-on-scroll"
import { Button } from "@/components/ui/button"
import { TEACHER_WORKSPACE_APP_URL } from "@/content/landing"
import { gaPageCopy } from "@/content/landing-ga-page"

/**
 * Section 7 of the IA: the coda line and the one repeated action. The hero
 * holds the page's single filled primary; this repeat steps down to outline
 * (CMP-5).
 */
export function GaClose() {
  const close = gaPageCopy.close
  const hero = gaPageCopy.hero
  return (
    <section
      aria-labelledby="ga-close-title"
      className="flex flex-col justify-center px-5 py-24 sm:px-8 lg:min-h-svh lg:py-24"
    >
      <RevealOnScroll>
        <div className="mx-auto flex w-full max-w-[1024px] flex-col items-center gap-5 text-center">
          <h2
            className="font-heading text-[clamp(1.875rem,4vw,3rem)] leading-[1.1] font-semibold tracking-tight text-balance text-[color:var(--paper-ink)]"
            id="ga-close-title"
          >
            {close.headline}
          </h2>
          <div className="mt-2 flex flex-col items-center gap-3">
            <Button
              asChild
              className="h-12 rounded-full border-[color:var(--cta-blue)] bg-transparent px-7 text-base font-semibold text-[color:var(--cta-blue)] transition-[background-color,scale] duration-200 ease-out hover:bg-primary/5 focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.96]"
              variant="outline"
            >
              <a href={TEACHER_WORKSPACE_APP_URL} rel="noreferrer">
                {hero.action}
              </a>
            </Button>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  )
}
