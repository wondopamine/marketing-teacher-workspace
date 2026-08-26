import { ChartNoAxesColumn, Sparkles, User } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { defineScript, useDemoScript } from "./ga-demo-script"
import {
  AppChip,
  EASE_OUT_QUART,
  Panel,
  PanelSurface,
} from "./ga-screen-chrome"
import { ProfileBackground } from "./ga-screen-profile"

import type { ScreenProps } from "./ga-screens"
import type { ReactNode } from "react"

/**
 * The suggestion, verbatim from the prototype's guidance card. This screen
 * sits behind a Release 2 capability flag in the product; the landing page
 * shows it under the PROPOSED posture the decision record carries, and never
 * names the flag.
 */
const guidance = {
  horizon: "Upcoming weeks",
  title: "Consider keeping the daily check-in going",
  body: [
    "Attendance has climbed from 72% to 93% over six weeks.",
    "The check-in routine is the likeliest reason it held —",
    "taper it slowly rather than stopping now that things look settled.",
  ],
  contact: "Form Teacher",
  resource: "Attendance support protocol",
} as const

type Step = {
  readonly panel: boolean
  /** How many pieces of the card have arrived: chip, title, 3 body lines, contact, resource. */
  readonly revealed: number
}

const PIECES = 7

/**
 * Act 3's timeline, on the reference's streaming beat: the panel opens, then
 * the suggestion arrives a piece at a time — the horizon chip, the title, the
 * reasoning line by line, who to contact, what to read — and holds.
 */
export const guidanceScript = defineScript<Step>(9000, [
  [0, { panel: false, revealed: 0 }],
  [600, { panel: true, revealed: 0 }],
  [1400, { panel: true, revealed: 1 }],
  [1900, { panel: true, revealed: 2 }],
  [2500, { panel: true, revealed: 3 }],
  [2950, { panel: true, revealed: 4 }],
  [3400, { panel: true, revealed: 5 }],
  [4000, { panel: true, revealed: 6 }],
  [4500, { panel: true, revealed: PIECES }],
])

/**
 * Act 3 — You know the steps. The profile, dimmed, with the suggestion
 * arriving in front of it. The decision framed as the teacher's stays in the
 * act's copy, where it belongs.
 */
export function GuidanceScreen({ active }: ScreenProps) {
  const current = useDemoScript(guidanceScript, active)
  return (
    <>
      {/* The profile recedes behind a scrim rather than through its own
          opacity: dimming the text itself took its muted labels to 2.3:1 and
          failed the page's contrast audit. A veil over the page is one
          element, and the text under it keeps its own colours. It reaches
          past the stage's right edge, as the screen does. */}
      <ProfileBackground target="Attendance" />
      <div
        aria-hidden
        className="absolute inset-y-0 right-[-50vw] left-0 z-[1] bg-[color:var(--paper)]/55"
      />
      <div className="absolute top-14 left-0 z-10 w-[520px]">
        <AnimatePresence initial={false}>
          {current.panel ? (
            <Panel className="p-5" key="guidance">
              <GuidanceBody revealed={current.revealed} />
            </Panel>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  )
}

/**
 * A piece of the card that arrives: mounted only once shown, so the settled
 * server render carries it at full opacity, and it fades up when it lands
 * during a pass. `AnimatePresence initial={false}` is what keeps the first
 * render from starting at zero.
 */
function Reveal({
  children,
  inline = false,
  show,
}: {
  readonly children: ReactNode
  readonly inline?: boolean
  readonly show: boolean
}) {
  const Tag = inline ? motion.span : motion.div
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <Tag
          animate={{ opacity: 1, y: 0 }}
          className={inline ? "inline-block" : undefined}
          initial={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
        >
          {children}
        </Tag>
      ) : null}
    </AnimatePresence>
  )
}

/** The suggestion's contents, arriving a piece at a time. */
function GuidanceBody({ revealed }: { readonly revealed: number }) {
  return (
    <>
      <p className="flex items-center gap-1.5 text-[12px] leading-4 font-semibold text-[color:var(--app-accent)]">
        <Sparkles aria-hidden className="size-3.5" />A suggested next step
      </p>
      <div className="mt-3 flex flex-col items-start gap-3">
        <Reveal show={revealed >= 1}>
          <AppChip className="h-6 px-2.5 text-[12px]" tone="orange">
            <ChartNoAxesColumn aria-hidden className="size-3.5" />
            {guidance.horizon}
          </AppChip>
        </Reveal>
        <Reveal show={revealed >= 2}>
          <p className="text-[17px] leading-6 font-semibold">
            {guidance.title}
          </p>
        </Reveal>
        <p className="text-[15px] leading-[1.6] text-[color:var(--app-muted)]">
          {guidance.body.map((line, index) => (
            <Reveal inline key={line} show={revealed >= 3 + index}>
              {line}{" "}
            </Reveal>
          ))}
        </p>
        <Reveal show={revealed >= 6}>
          <span className="flex items-center gap-3 text-[14px] text-[color:var(--app-muted)]">
            Contact
            <AppChip className="h-7 px-2.5 text-[13px] text-[color:var(--app-ink)]">
              <User aria-hidden className="size-3.5" />
              {guidance.contact}
            </AppChip>
          </span>
        </Reveal>
        <Reveal show={revealed >= 7}>
          <span className="flex items-center gap-3 text-[14px] text-[color:var(--app-muted)]">
            Resources
            <span className="text-[color:var(--app-ink)]">
              {guidance.resource}
            </span>
          </span>
        </Reveal>
      </div>
    </>
  )
}

/**
 * Act 3's one component, for the reveal's card: the suggestion itself,
 * complete.
 */
export function GuidanceComponent() {
  return (
    <PanelSurface className="w-[520px] p-5">
      <GuidanceBody revealed={PIECES} />
    </PanelSurface>
  )
}
