/**
 * The first tab stop on every route.
 *
 * `focus:top-4` put it at 16px, under the SG masthead — which is `fixed` at
 * z-51 over this link's z-50, and 68px tall at 320 where its line wraps three
 * ways. The bypass mechanism was 100% covered at 320 and 84% at 360–430:
 * `elementFromPoint` at its centre returned `SGDS-MASTHEAD`, and its focus ring
 * was drawn underneath (design review, 2026-08-26, A11Y-2/A11Y-10). It takes
 * the masthead's measured height now, like the header and every page's top
 * padding — which lands it in the same band as the GA page's nav tray, whose
 * wordmark then covered it at 320–430. So it also outranks both: z-52 over the
 * masthead's 51 and the headers' 50. A focused bypass link is the one thing on
 * the page that has to be on top of everything.
 */
export function SkipLink() {
  return (
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:top-[calc(var(--masthead-h,0px)+1rem)] focus:left-4 focus:z-[52] focus:rounded-full focus:border focus:border-[color:var(--paper-rule)] focus:bg-[color:var(--paper-card)] focus:px-4 focus:py-2 focus:font-heading focus:text-sm focus:text-[color:var(--paper-ink)] focus:shadow-[0_10px_40px_-20px_rgb(15_23_42/0.18)] focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      href="#main"
    >
      Skip to main content
    </a>
  )
}
