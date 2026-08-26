import {
  ChevronRight,
  Clock,
  Columns2,
  Funnel,
  Paperclip,
  Search,
  Users,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { defineScript, useDemoScript } from "./ga-demo-script"
import {
  AppChip,
  AppInput,
  EASE_IN_OUT_CUBIC,
  Panel,
  PanelSurface,
  Redaction,
  Screen,
} from "./ga-screen-chrome"

import type { ScreenProps } from "./ga-screens"

const POST_TITLE = "Start of Term 3: What to Expect"

const POST_BODY =
  "Dear families, welcome back to Term 3! Here's what Primary 5 will be exploring this term, and how you can follow along at home. We'll share reminders here as the term goes on — nothing to reply to for now."

/** Families the post went to. Three, like the prototype's own example. */
const RECIPIENTS = 3

type Step = {
  readonly panel: boolean
  readonly read: number
  readonly reminder: boolean
}

/**
 * Act 5's timeline: the posted letter, then its overview arrives and the
 * read count climbs one family at a time; the reminder for whoever is left
 * schedules itself, and that is where it rests.
 */
export const postScript = defineScript<Step>(9000, [
  [0, { panel: false, read: 0, reminder: false }],
  [700, { panel: true, read: 0, reminder: false }],
  [1600, { panel: true, read: 1, reminder: false }],
  [2400, { panel: true, read: 2, reminder: false }],
  [3400, { panel: true, read: 2, reminder: true }],
])

/**
 * Act 5 — Every family is in the loop. The posted letter behind, and the
 * delivery overview in front: read, unread, and the reminder the teacher
 * never has to send. The recipient list itself is redacted — it holds
 * parents' contact details in the product, and stays there.
 */
export function PostScreen({ active }: ScreenProps) {
  const current = useDemoScript(postScript, active)
  return (
    <>
      <div className="absolute top-8 left-[var(--screen-x)] w-[900px]">
        <Screen className="h-[640px] bg-[color:var(--app-ground)]">
          <div className="flex h-12 items-center gap-2 border-b border-[color:var(--app-rule)] bg-[color:var(--app-surface)] px-5 text-[color:var(--app-muted)]">
            Communications
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-[color:var(--app-ink)]">{POST_TITLE}</span>
          </div>
          <div className="border-b border-[color:var(--app-rule)] bg-[color:var(--app-surface)] px-6 py-4">
            <p className="flex items-center gap-2.5 text-[19px] leading-6 font-semibold">
              {POST_TITLE}
              <AppChip tone="green">Posted</AppChip>
            </p>
            <p className="mt-1 text-[13px] text-[color:var(--app-muted)]">
              Posted 26 Aug 2026, 4:15 pm · Mr Tan
            </p>
          </div>

          <div className="grid grid-cols-[1fr_300px] gap-5 px-6 py-5">
            <div className="rounded-xl border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] p-5">
              <p className="text-[12px] leading-4 font-semibold tracking-wide text-[color:var(--app-muted)] uppercase">
                Status
              </p>
              <div className="mt-3 flex items-center gap-2">
                <AppInput
                  className="h-8 flex-1"
                  icon={
                    <Search
                      aria-hidden
                      className="size-3.5 text-[color:var(--app-muted)]"
                    />
                  }
                  placeholder
                >
                  Search student or parent
                </AppInput>
                <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[color:var(--app-rule)] px-2.5 text-[12px]">
                  <Funnel aria-hidden className="size-3.5" />
                  Filter
                </span>
                <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[color:var(--app-rule)] px-2.5 text-[12px]">
                  <Columns2 aria-hidden className="size-3.5" />
                  Columns
                </span>
              </div>
              <div className="mt-3 grid grid-cols-[1.2fr_0.6fr_0.8fr_1.4fr] gap-x-4 border-b border-[color:var(--app-rule)] pb-2 text-[12px] text-[color:var(--app-muted)]">
                <span>Student</span>
                <span>Class</span>
                <span>Read status</span>
                <span>Parent / Guardian</span>
              </div>
              {/* Who read what is the product's to show. Here: the shape of
                  the list, never a name or a number to reach a family by. */}
              {Array.from({ length: RECIPIENTS }, (_, index) => (
                <div
                  className="grid grid-cols-[1.2fr_0.6fr_0.8fr_1.4fr] items-center gap-x-4 border-b border-[color:var(--app-rule-soft)] py-3"
                  key={index}
                >
                  <Redaction widths={["80%"]} />
                  <Redaction widths={["50%"]} />
                  <span className="text-[13px]">
                    {index < current.read ? (
                      <span className="font-medium text-[color:var(--app-trend-up)]">
                        Read
                      </span>
                    ) : (
                      <span className="text-[color:var(--app-muted)]">
                        Unread
                      </span>
                    )}
                  </span>
                  <Redaction widths={["70%", "40%"]} />
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] p-5">
              <p className="text-[12px] leading-4 font-semibold tracking-wide text-[color:var(--app-muted)] uppercase">
                Post
              </p>
              <p className="mt-2 text-[15px] leading-5 font-semibold">
                {POST_TITLE}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-[color:var(--app-muted)]">
                {POST_BODY}
              </p>
              <p className="mt-4 text-[12px] text-[color:var(--app-muted)]">
                Attachments
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[13px]">
                <Paperclip
                  aria-hidden
                  className="size-3.5 text-[color:var(--app-muted)]"
                />
                Term 3 overview.pdf
                <span className="text-[12px] text-[color:var(--app-muted)]">
                  212 KB
                </span>
              </p>
            </div>
          </div>
        </Screen>
      </div>

      <div className="absolute top-14 left-0 z-10 w-[440px]">
        <AnimatePresence initial={false}>
          {current.panel ? (
            <Panel className="p-5" key="overview">
              <OverviewBody read={current.read} reminder={current.reminder} />
            </Panel>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  )
}

/** The overview's contents: read of sent, and the reminder. */
function OverviewBody({
  read,
  reminder,
}: {
  readonly read: number
  readonly reminder: boolean
}) {
  const unread = RECIPIENTS - read
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] leading-4 font-semibold tracking-wide text-[color:var(--app-muted)] uppercase">
            Overview
          </p>
          <p className="mt-2 text-[28px] leading-8 font-semibold tabular-nums">
            {read}
            <span className="text-[16px] font-normal text-[color:var(--app-muted)]">
              {" "}
              / {RECIPIENTS}
            </span>
          </p>
          <p
            className={
              unread === 0
                ? "mt-1 text-[13px] font-medium text-[color:var(--app-trend-up)]"
                : "mt-1 text-[13px] font-medium text-[color:var(--app-tag-orange-ink)]"
            }
          >
            {unread === 0 ? "All families have read this" : `${unread} unread`}
          </p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-full bg-[color:var(--app-accent-soft)] text-[color:var(--app-accent)]">
          <Users aria-hidden className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--app-rule-soft)]">
          <motion.span
            animate={{ scaleX: read / RECIPIENTS }}
            className="absolute inset-0 origin-left rounded-full bg-[color:var(--app-accent)] will-change-transform"
            initial={false}
            transition={{ duration: 0.4, ease: EASE_IN_OUT_CUBIC }}
          />
        </span>
        <span className="text-[12px] text-[color:var(--app-muted)] tabular-nums">
          {read} / {RECIPIENTS}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {reminder ? (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 border-t border-[color:var(--app-rule)] pt-3 text-[13px] text-[color:var(--app-muted)]"
            initial={{ opacity: 0, y: 6 }}
            key="reminder"
            transition={{ duration: 0.2 }}
          >
            <Clock aria-hidden className="size-3.5" />
            Reminder scheduled for {unread === 1
              ? "the family"
              : "families"}{" "}
            yet to read · Thu, 9:00 am
          </motion.p>
        ) : null}
      </AnimatePresence>
    </>
  )
}

/**
 * Act 5's one component, for the reveal's card: the delivery overview, at the
 * frame the demonstration rests on.
 */
export function PostComponent() {
  return (
    <PanelSurface className="w-[440px] p-5">
      <OverviewBody read={2} reminder />
    </PanelSurface>
  )
}
