import { MemoCard } from "./memo-card"
import { RevealOnScroll } from "./reveal-on-scroll"

import { schoolsTodayCopy } from "@/content/landing"

export function SchoolsToday() {
  return (
    <section
      className="relative px-5 py-10 sm:px-8 sm:py-16 lg:py-20"
      id="schools"
    >
      <div className="mx-auto w-full max-w-[1412px] rounded-[28px] bg-[color:var(--memo-section-bg)] px-6 py-14 sm:rounded-[44px] sm:px-12 sm:py-24 lg:px-24 lg:py-28">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-[clamp(1.75rem,4vw,3.5rem)] leading-[1.08] font-medium tracking-tight text-balance text-[color:var(--paper-ink)]">
              {schoolsTodayCopy.heading}
            </h2>
            <p className="mt-6 text-base leading-[1.7] text-balance text-[color:var(--paper-muted)] sm:text-lg">
              {schoolsTodayCopy.subheading}
            </p>
          </div>
        </RevealOnScroll>

        <div className="mx-auto mt-14 grid w-full max-w-[1220px] grid-cols-1 gap-10 sm:gap-7 lg:mt-20 lg:grid-cols-3 [perspective:900px]">
          {schoolsTodayCopy.cases.map((memo, i) => (
            <MemoCard index={i} key={memo.number} memo={memo} />
          ))}
        </div>
      </div>
    </section>
  )
}
