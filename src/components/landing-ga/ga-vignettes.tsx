import { CalendarCheckIcon, CheckCheckIcon, ClockIcon, SparklesIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { GaJourneyActId } from "@/content/landing-ga-page"
import type { ReactNode } from "react"

/**
 * Coded feature vignettes (stakeholder feedback, 2026-08-21): each journey
 * act is illustrated by a small excerpt of the capability — the filter, the
 * category rail, the read receipts — never a full product screen. Only
 * information categories and purpose-built synthetic values render, so
 * Behaviour/Family details can never appear on the public page.
 *
 * Motion is transform/opacity only, ≤300ms per step, and every vignette
 * server-renders its settled state: `animate` is false on the server, under
 * reduced motion, and until the act is active, so no-JS readers always get
 * the complete composition.
 */

type VignetteProps = {
  /** Step the ambient sequence forward. False = settled state, no motion. */
  readonly animate: boolean
}

/** One synthetic class list, shared by the identify and posts vignettes. */
const students = [
  { name: "Aisha Rahman", criteria: ["attendance", "fas"] },
  { name: "Marcus Tan", criteria: ["attendance"] },
  { name: "Priya Nair", criteria: ["cca", "social"] },
  { name: "Wei Ling Chua", criteria: ["attendance", "cca"] },
  { name: "Danish Hakim", criteria: ["social"] },
  { name: "Ethan Lim", criteria: ["cca", "fas"] },
] as const

type CriterionId = (typeof students)[number]["criteria"][number]

const criteria: ReadonlyArray<{ id: CriterionId; label: string }> = [
  { id: "attendance", label: "Attendance" },
  { id: "cca", label: "CCA attendance" },
  { id: "social", label: "Social links" },
  { id: "fas", label: "FAS" },
]

const criterionLabel = new Map(criteria.map((entry) => [entry.id, entry.label]))

/** The chip combinations the ambient cycle steps through while unattended. */
const identifyCycle: ReadonlyArray<ReadonlyArray<CriterionId>> = [
  ["attendance"],
  ["attendance", "fas"],
  ["cca"],
  ["social", "cca"],
]

/**
 * Act 1 — You identify. The one genuinely interactive vignette: the filter
 * chips work, and the class list narrows to the students who match. While
 * nobody is interacting it gently cycles through example criteria.
 */
function IdentifyVignette({ animate }: VignetteProps) {
  const [selected, setSelected] = useState<ReadonlyArray<CriterionId>>([
    "attendance",
  ])
  const [touched, setTouched] = useState(false)
  const cycleStep = useRef(0)

  useEffect(() => {
    if (!animate || touched) return
    // Two passes through the example criteria, then rest: auto-updating
    // content must come to a stop on its own (WCAG 2.2.2 posture) — and the
    // visitor can stop it any time by touching a chip.
    let ticks = 0
    const timer = setInterval(() => {
      ticks += 1
      if (ticks > identifyCycle.length * 2) {
        clearInterval(timer)
        return
      }
      cycleStep.current = (cycleStep.current + 1) % identifyCycle.length
      setSelected(identifyCycle[cycleStep.current] ?? ["attendance"])
    }, 2800)
    return () => clearInterval(timer)
  }, [animate, touched])

  const toggle = (id: CriterionId) => {
    setTouched(true)
    setSelected((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id]
    )
  }

  const matches = students.filter(
    (student) =>
      selected.length === 0 ||
      student.criteria.some((entry) => selected.includes(entry))
  )

  return (
    <VignetteCard>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-body text-sm leading-5 font-semibold text-[color:var(--paper-ink)]">
          Student Profiles
        </p>
        <p aria-hidden className="font-body text-xs leading-4 text-[color:var(--paper-muted)] tabular-nums">
          {selected.length === 0
            ? "All students shown"
            : `${matches.length} of ${students.length} match`}
        </p>
        <span className="sr-only">
          A list of six synthetic students; the selected criteria highlight the
          students who match.
        </span>
        {/* Live from mount, content gated on touch: the ambient cycle stays
            silent, and the visitor's first toggle is announced reliably. */}
        <span aria-live="polite" className="sr-only">
          {touched
            ? selected.length === 0
              ? "All students shown"
              : `${matches.length} of ${students.length} students match`
            : null}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="font-body text-xs leading-4 text-[color:var(--paper-muted)]">
          Filter by
        </span>
        {criteria.map((criterion) => {
          const active = selected.includes(criterion.id)
          return (
            <button
              aria-pressed={active}
              className={`inline-flex min-h-11 items-center rounded-full border px-3 font-body text-xs leading-4 font-medium transition-colors duration-200 ease-out lg:min-h-6 lg:px-2.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                active
                  ? "border-primary/40 bg-primary/10 text-[color:var(--cta-blue)]"
                  : "border-[color:var(--paper-rule-strong)] text-[color:var(--paper-muted)] hover:bg-[color:var(--paper-hover-bg)]"
              }`}
              key={criterion.id}
              onClick={() => toggle(criterion.id)}
              type="button"
            >
              {criterion.label}
            </button>
          )
        })}
      </div>
      <ul className="mt-4 flex list-none flex-col gap-1">
        {students.map((student) => {
          const matched =
            selected.length === 0 ||
            student.criteria.some((entry) => selected.includes(entry))
          return (
            <li
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-[border-color,background-color] duration-300 ease-out ${
                matched
                  ? "border-[color:var(--paper-rule)] bg-[color:var(--paper-card)]"
                  : "border-transparent"
              }`}
              key={student.name}
            >
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={`flex size-6 items-center justify-center rounded-full font-body text-xs leading-none font-semibold transition-colors duration-300 ease-out ${
                    matched
                      ? "bg-[color:var(--audience-sky)] text-[color:var(--cta-ground)]"
                      : "bg-[color:var(--paper-hover-bg)] text-[color:var(--paper-muted)]"
                  }`}
                >
                  {student.name.split(" ")[0]?.[0]}
                  {student.name.split(" ").at(-1)?.[0]}
                </span>
                <span
                  className={`font-body text-sm leading-5 transition-colors duration-300 ease-out ${
                    matched
                      ? "text-[color:var(--paper-ink)]"
                      : "text-[color:var(--paper-muted)]"
                  }`}
                >
                  {student.name}
                </span>
              </span>
              <span className="flex gap-1">
                {student.criteria
                  .filter((entry) => selected.includes(entry))
                  .map((entry) => (
                    <span
                      className="rounded-sm bg-[color:var(--paper-hover-bg)] px-1.5 py-0.5 font-body text-xs leading-4 text-[color:var(--paper-muted)]"
                      key={entry}
                    >
                      {criterionLabel.get(entry)}
                    </span>
                  ))}
              </span>
            </li>
          )
        })}
      </ul>
    </VignetteCard>
  )
}

/** The profile sections the holistic vignette names. Categories only. */
const profileSections = ["Attendance", "CCA", "Wellbeing", "Behaviour", "Family"]

/**
 * Act 2 — You understand. The profile shown as its information categories:
 * the jump rail and card headers communicate "one holistic profile" while the
 * Behaviour and Family sections stay deliberately redacted.
 */
function HolisticVignette({ animate }: VignetteProps) {
  const highlighted = useCycle(animate, profileSections.length, 2200)

  return (
    <VignetteCard>
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-[color:var(--audience-cream)] font-body text-xs leading-none font-semibold text-[color:var(--paper-ink)]">
          RW
        </span>
        <div>
          <p className="font-body text-sm leading-5 font-semibold text-[color:var(--paper-ink)]">
            Rachel Wong Mei Ling
          </p>
          <p className="font-body text-xs leading-4 text-[color:var(--paper-muted)]">
            Primary 5 · synthetic record
          </p>
        </div>
      </div>
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {profileSections.map((section, index) => (
          <span
            className={`font-body text-xs leading-4 font-medium underline-offset-4 transition-colors duration-300 ease-out ${
              index === highlighted
                ? "text-[color:var(--cta-blue)] underline decoration-[color:var(--cta-blue)]/40"
                : "text-[color:var(--paper-muted)]"
            }`}
            key={section}
          >
            {section}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="rounded-lg border border-[color:var(--paper-rule)] bg-[color:var(--paper-card)] p-3">
          <div className="flex items-center justify-between">
            <p className="font-body text-xs leading-4 font-semibold text-[color:var(--paper-ink)]">
              Attendance
            </p>
            <p className="font-body text-xs leading-4 text-[color:var(--paper-muted)]">
              Term 3
            </p>
          </div>
          <div aria-hidden className="mt-2 flex items-end gap-1">
            {[14, 16, 15, 16, 16, 13, 16, 16, 15, 16].map((height, index) => (
              <span
                className="w-3 rounded-sm bg-[color:var(--audience-sky)]"
                key={index}
                style={{ height }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["Behaviour", "Family"].map((section) => (
            <div
              className="rounded-lg border border-[color:var(--paper-rule)] bg-[color:var(--paper-card)] p-3"
              key={section}
            >
              <p className="font-body text-xs leading-4 font-semibold text-[color:var(--paper-ink)]">
                {section}
              </p>
              <div aria-hidden className="mt-2 flex flex-col gap-1.5">
                <span className="h-2 w-4/5 rounded-sm bg-[color:var(--paper-hover-bg)]" />
                <span className="h-2 w-3/5 rounded-sm bg-[color:var(--paper-hover-bg)]" />
              </div>
            </div>
          ))}
        </div>
        <p className="font-body text-xs leading-4 text-[color:var(--paper-muted)] italic">
          Sensitive sections stay inside the profile.
        </p>
      </div>
    </VignetteCard>
  )
}

/**
 * Act 3 — You know the steps. One suggestion card, and the decision framed
 * as the teacher's.
 */
function GuidanceVignette({ animate }: VignetteProps) {
  const step = useCycle(animate, 2, 3400)

  return (
    <VignetteCard>
      <p className="flex items-center gap-1.5 font-body text-xs leading-4 font-semibold text-[color:var(--cta-blue)]">
        <SparklesIcon aria-hidden className="size-3.5" />
        A suggested next step
      </p>
      <p className="mt-3 font-body text-sm leading-[1.6] text-[color:var(--paper-ink)]">
        Attendance has held steady for six weeks. A short note home could help
        sustain it.
      </p>
      <div aria-hidden className="mt-4 flex gap-2">
        <span
          className={`inline-flex min-h-8 items-center rounded-lg bg-primary/10 px-3 font-body text-xs leading-4 font-semibold text-[color:var(--cta-blue)] transition-transform duration-300 ease-out ${
            animate && step === 1 ? "scale-[1.04]" : "scale-100"
          }`}
        >
          Use this step
        </span>
        <span className="inline-flex min-h-8 items-center rounded-lg border border-[color:var(--paper-rule-strong)] px-3 font-body text-xs leading-4 font-medium text-[color:var(--paper-muted)]">
          Not now
        </span>
      </div>
      <p className="mt-4 border-t border-[color:var(--paper-rule)] pt-3 font-body text-xs leading-4 text-[color:var(--paper-muted)] italic">
        You decide what fits.
      </p>
    </VignetteCard>
  )
}

const draftLines = [
  "Dear families, welcome back to Term 3!",
  "Here's what Primary 5 will be exploring this term, and how you can follow along at home.",
]

/**
 * Act 4 — The words are ready. A first draft arriving in the school's
 * format: template named, title filled, the opening lines settling in.
 */
function DraftVignette({ animate }: VignetteProps) {
  const revealed = useSteppedReveal(animate, draftLines.length + 2, 700)

  return (
    <VignetteCard>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[color:var(--audience-mint)] px-2.5 py-0.5 font-body text-xs leading-4 font-medium text-[color:var(--paper-ink)]">
          Term Update Letter
        </span>
        <span className="font-body text-xs leading-4 text-[color:var(--paper-muted)]">
          AI Draft
        </span>
      </div>
      <p
        className={`mt-3.5 font-body text-sm leading-5 font-semibold text-[color:var(--paper-ink)] transition-[opacity,translate] duration-300 ease-out ${
          revealed >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        Start of Term 3: What to Expect
      </p>
      <div className="mt-2.5 flex flex-col gap-1.5">
        {draftLines.map((line, index) => (
          <p
            className={`font-body text-xs leading-[1.6] text-[color:var(--paper-muted)] transition-[opacity,translate] duration-300 ease-out ${
              revealed >= index + 2
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0"
            }`}
            key={line}
          >
            {line}
          </p>
        ))}
        <span aria-hidden className="mt-1 h-2 w-2/5 rounded-sm bg-[color:var(--paper-hover-bg)]" />
      </div>
      <p className="mt-4 border-t border-[color:var(--paper-rule)] pt-3 font-body text-xs leading-4 text-[color:var(--paper-muted)] italic">
        Review and edit every word before it goes out.
      </p>
    </VignetteCard>
  )
}

const recipients = [
  { name: "Mrs Rahman", state: "read", note: "Read this morning" },
  { name: "Mr Tan", state: "read", note: "Read 2:15pm" },
  { name: "Mdm Chua", state: "reminder", note: "Reminder scheduled" },
] as const

/**
 * Act 5 — Every family is in the loop. The posted update's delivery states:
 * read receipts, and the reminder the teacher never has to chase.
 */
function PostsVignette({ animate }: VignetteProps) {
  const revealed = useSteppedReveal(animate, recipients.length, 900)

  return (
    <VignetteCard>
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-sm leading-5 font-semibold text-[color:var(--paper-ink)]">
          Start of Term 3: What to Expect
        </p>
        <span className="flex items-center gap-1 rounded-full bg-[color:var(--audience-mint)] px-2 py-0.5 font-body text-xs leading-4 font-semibold text-[color:var(--paper-ink)]">
          <CalendarCheckIcon aria-hidden className="size-3" />
          Posted
        </span>
      </div>
      <ul className="mt-3.5 flex list-none flex-col gap-1">
        {recipients.map((recipient, index) => (
          <li
            className={`flex items-center justify-between gap-3 rounded-lg border border-[color:var(--paper-rule)] bg-[color:var(--paper-card)] px-3 py-2 transition-[opacity,translate] duration-300 ease-out ${
              revealed >= index + 1
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-40"
            }`}
            key={recipient.name}
          >
            <span className="font-body text-sm leading-5 text-[color:var(--paper-ink)]">
              {recipient.name}
            </span>
            <span
              className={`flex items-center gap-1 font-body text-xs leading-4 ${
                recipient.state === "read"
                  ? "text-[color:var(--cta-blue)]"
                  : "text-[color:var(--paper-muted)]"
              }`}
            >
              {recipient.state === "read" ? (
                <CheckCheckIcon aria-hidden className="size-3.5" />
              ) : (
                <ClockIcon aria-hidden className="size-3.5" />
              )}
              {recipient.note}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-[color:var(--paper-rule)] pt-3 font-body text-xs leading-4 text-[color:var(--paper-muted)] italic">
        Delivery stays on the record.
      </p>
    </VignetteCard>
  )
}

/** Shared chrome: one floating product excerpt on the paper ground. */
function VignetteCard({ children }: { readonly children: ReactNode }) {
  return (
    <div className="w-full max-w-[420px] rounded-xl border border-[color:var(--paper-rule-strong)] bg-[color:var(--memo-bg)] p-4 shadow-[var(--paper-shadow-card)]">
      {children}
    </div>
  )
}

/**
 * Step 0..steps-1 while animating, for two passes, then come to rest
 * (-1 = settled, nothing highlighted): auto-updating content stops on its own.
 */
function useCycle(animate: boolean, steps: number, interval: number) {
  const [step, setStep] = useState(-1)
  useEffect(() => {
    if (!animate) {
      setStep(-1)
      return
    }
    let ticks = 0
    const timer = setInterval(() => {
      ticks += 1
      if (ticks > steps * 2) {
        clearInterval(timer)
        setStep(-1)
        return
      }
      setStep((current) => (current + 1) % steps)
    }, interval)
    return () => clearInterval(timer)
  }, [animate, steps, interval])
  return animate ? step : -1
}

/**
 * Reveal steps one by one while animating; fully revealed when settled so
 * the server and reduced-motion renders are always complete.
 */
function useSteppedReveal(animate: boolean, steps: number, interval: number) {
  const [revealed, setRevealed] = useState(steps)
  useEffect(() => {
    if (!animate) {
      setRevealed(steps)
      return
    }
    setRevealed(0)
    let step = 0
    const timer = setInterval(() => {
      step += 1
      setRevealed(step)
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [animate, steps, interval])
  return revealed
}

export const gaActVignettes: Record<
  GaJourneyActId,
  (props: VignetteProps) => ReactNode
> = {
  promise: IdentifyVignette,
  notice: HolisticVignette,
  "next-steps": GuidanceVignette,
  words: DraftVignette,
  "family-and-record": PostsVignette,
}
