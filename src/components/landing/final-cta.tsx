import { EmailCapture } from "@/components/landing/email-capture"

export function FinalCta() {
  return (
    <section
      className="overflow-hidden bg-[color:var(--cta-ground)] px-5 py-24 text-white sm:px-8"
      id="pricing"
    >
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-medium tracking-[0.16em] text-white/62 uppercase">
          Free for individual teachers
        </p>
        <h2 className="mt-5 font-heading text-4xl leading-tight font-semibold text-balance sm:text-7xl">
          Close the laptop with nothing hiding in another tab.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/66">
          Join the early list for Teacher Workspace. Schools are welcome, and
          individual teachers can start free.
        </p>
        <div className="mx-auto mt-10 max-w-xl">
          <EmailCapture />
        </div>
      </div>
    </section>
  )
}
