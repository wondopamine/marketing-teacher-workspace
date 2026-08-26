import {
  Bold,
  ChevronDown,
  ChevronRight,
  Eye,
  Italic,
  List,
  Send,
  Sparkles,
  Underline,
  User,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { defineScript, typedFrames, useDemoScript } from "./ga-demo-script"
import {
  AppButton,
  AppChip,
  EASE_OUT_QUART,
  Panel,
  PanelSurface,
  Screen,
} from "./ga-screen-chrome"

import type { ScreenProps } from "./ga-screens"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * The templates the picker offers, each with the response it asks of
 * families. The product's picker is authored by the school; these four are
 * the landing page's synthetic set and are flagged in the decision record for
 * the owner to confirm.
 */
const templates = [
  { name: "Term Update Letter", asks: "No reply needed" },
  { name: "Excursion Consent", asks: "Consent required" },
  { name: "Event Reminder", asks: "RSVP requested" },
  { name: "Meet-the-Parents Invitation", asks: "Reply with a time slot" },
] as const

const DRAFT_TITLE = "Start of Term 3: What to Expect"

const DRAFT_BODY = [
  "Dear families, welcome back to Term 3!",
  "Here's what Primary 5 will be exploring this term, and how you can follow along at home.",
  "We'll share reminders here as the term goes on — nothing to reply to for now.",
] as const

type Step = {
  readonly picker: boolean
  /** The template the highlight rests on. */
  readonly highlight: number | null
  readonly chosen: boolean
  readonly pressed: boolean
  readonly title: string
  /** Body lines that have arrived. */
  readonly lines: number
  /** The note that the draft is the teacher's to review. */
  readonly note: boolean
}

const EMPTY: Step = {
  picker: false,
  highlight: null,
  chosen: false,
  pressed: false,
  title: "",
  lines: 0,
  note: false,
}

const picking = (
  highlight: number | null,
  extra: Partial<Step> = {}
): Step => ({
  ...EMPTY,
  picker: true,
  highlight,
  ...extra,
})

const drafting = (title: string, lines = 0, note = false): Step => ({
  ...EMPTY,
  title,
  lines,
  note,
})

/**
 * Act 4's timeline: an empty composer, the picker opens, the highlight walks
 * the templates and settles on the term letter, Draft post is pressed, the
 * picker leaves, and the draft types itself in — title first, then the body a
 * line at a time — with the note that it is the teacher's to edit.
 */
export const composerScript = defineScript<Step>(12000, [
  [0, EMPTY],
  [1000, picking(null)],
  [1600, picking(0)],
  [2200, picking(1)],
  [2800, picking(2)],
  [3300, picking(0, { chosen: true })],
  [3900, picking(0, { chosen: true, pressed: true })],
  [4100, drafting("")],
  ...typedFrames(4500, DRAFT_TITLE, 45, (typed) => drafting(typed)),
  [6400, drafting(DRAFT_TITLE, 1)],
  [7100, drafting(DRAFT_TITLE, 2)],
  [7800, drafting(DRAFT_TITLE, 3)],
  [8400, drafting(DRAFT_TITLE, 3, true)],
])

/**
 * Act 4 — The words are ready. The composer behind, the template picker in
 * front, and the first draft arriving where the teacher will edit it.
 */
export function ComposerScreen({ active }: ScreenProps) {
  const current = useDemoScript(composerScript, active)
  const typingTitle =
    current.title.length > 0 && current.title.length < DRAFT_TITLE.length
  return (
    <>
      <div className="absolute top-8 left-[var(--screen-x)] w-[900px]">
        <Screen className="h-[640px] bg-[color:var(--app-ground)]">
          <div className="flex h-12 items-center gap-2 border-b border-[color:var(--app-rule)] bg-[color:var(--app-surface)] px-5 text-[color:var(--app-muted)]">
            Communications
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-[color:var(--app-ink)]">New post</span>
          </div>
          <div className="flex h-14 items-center justify-between border-b border-[color:var(--app-rule)] bg-[color:var(--app-surface)] px-5">
            <span className="text-[15px] font-medium">New post</span>
            <span className="flex items-center gap-3">
              <span className="text-[12px] text-[color:var(--app-muted)]">
                Draft
              </span>
              <span className="flex items-center gap-1.5 text-[13px]">
                <Eye aria-hidden className="size-4" />
                Hide preview
              </span>
              {/* Not yet postable: soft ground and accent ink, rather than the
                  filled button at half opacity, which put white on pale blue. */}
              <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[color:var(--app-accent-soft)] px-3 text-[13px] font-medium text-[color:var(--app-accent-ink)]">
                <Send aria-hidden className="size-3.5" />
                Post
                <ChevronDown aria-hidden className="size-3.5" />
              </span>
            </span>
          </div>

          <div className="grid grid-cols-[1fr_280px] gap-5 px-6 py-5">
            <div className="rounded-xl border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] p-5">
              <p className="text-[12px] leading-4 font-semibold tracking-wide text-[color:var(--app-muted)] uppercase">
                Content
              </p>
              <FieldLabel count={`${current.title.length}/120`}>
                Title
              </FieldLabel>
              <div
                className={cn(
                  "mt-1.5 flex h-10 items-center rounded-lg border px-3 text-[14px]",
                  typingTitle
                    ? "border-[color:var(--app-accent)] shadow-[0_0_0_3px_var(--app-accent-soft)]"
                    : "border-[color:var(--app-rule)]"
                )}
              >
                {current.title.length === 0 ? (
                  <span className="text-[color:var(--app-muted)]">
                    Give the post a title
                  </span>
                ) : (
                  current.title
                )}
              </div>
              <FieldLabel
                count={`${DRAFT_BODY.slice(0, current.lines).join(" ").length}/2000`}
              >
                Details
              </FieldLabel>
              <div className="mt-1.5 overflow-hidden rounded-lg border border-[color:var(--app-rule)]">
                <div className="flex h-9 items-center gap-3 border-b border-[color:var(--app-rule)] bg-[color:var(--app-ground)] px-3 text-[color:var(--app-muted)]">
                  <Bold aria-hidden className="size-3.5" />
                  <Italic aria-hidden className="size-3.5" />
                  <Underline aria-hidden className="size-3.5" />
                  <span className="h-4 w-px bg-[color:var(--app-rule)]" />
                  <List aria-hidden className="size-3.5" />
                </div>
                <div className="flex min-h-[168px] flex-col gap-2 px-3 py-3 text-[14px] leading-6">
                  {current.lines === 0 ? (
                    <span className="text-[color:var(--app-muted)]">
                      Write the details families will read
                    </span>
                  ) : null}
                  {DRAFT_BODY.slice(0, current.lines).map((line) => (
                    <Arrive key={line}>
                      <p>{line}</p>
                    </Arrive>
                  ))}
                </div>
              </div>
            </div>

            {/* The preview families see, filling in as the draft does. */}
            <div className="rounded-xl border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] p-4">
              <p className="text-[13px] font-medium">Preview</p>
              <p className="mt-1 text-[11px] leading-4 text-[color:var(--app-muted)]">
                How parents will see this post on the Parents Gateway app.
              </p>
              {/* A card like every other card here (owner, 2026-08-26): the 6px slab
                  it had read as a device bezel and was the heaviest line on the
                  screen. The preview is a panel of the composer, not a phone. */}
              <div className="mt-3 rounded-xl border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] p-3 text-[11px] leading-4">
                <p className="min-h-4 font-semibold">{current.title}</p>
                <p className="mt-0.5 text-[9px] tracking-wide text-[color:var(--app-muted)] uppercase">
                  26 Aug 2026 · Mr Tan
                </p>
                <p className="mt-1 flex items-center gap-1 text-[9px] tracking-wide text-[color:var(--app-muted)] uppercase">
                  <User aria-hidden className="size-2.5" />
                  Student name
                </p>
                <div className="mt-2 border-t border-[color:var(--app-rule)] pt-2 text-[color:var(--app-muted)]">
                  {DRAFT_BODY.slice(0, current.lines).map((line) => (
                    <p className="mt-1" key={line}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Screen>
      </div>

      <div className="absolute top-14 left-0 z-10 w-[480px]">
        <AnimatePresence initial={false} mode="wait">
          {current.picker ? (
            <Panel className="p-5" key="picker">
              <DraftPickerBody
                chosen={current.chosen}
                highlight={current.highlight}
                pressed={current.pressed}
              />
            </Panel>
          ) : current.note ? (
            <Panel className="flex items-center gap-2.5 px-4 py-3" key="note">
              <Sparkles
                aria-hidden
                className="size-4 shrink-0 text-[color:var(--app-accent)]"
              />
              <span className="text-[13px]">
                Drafted from{" "}
                <span className="font-medium">Term Update Letter</span>. Review
                and edit before posting.
              </span>
              <AppChip className="ml-auto" tone="blue">
                Draft
              </AppChip>
            </Panel>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  )
}

function FieldLabel({
  children,
  count,
}: {
  readonly children: ReactNode
  readonly count: string
}) {
  return (
    <p className="mt-4 flex items-center justify-between text-[13px]">
      <span className="font-medium">
        {children} <span className="text-[color:var(--app-trend-down)]">*</span>
      </span>
      <span className="text-[12px] text-[color:var(--app-muted)] tabular-nums">
        {count}
      </span>
    </p>
  )
}

/** A line that lands: fades up on arrival, full opacity when settled. */
function Arrive({ children }: { readonly children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/** The picker's contents: the templates, and the two actions. */
function DraftPickerBody({
  chosen,
  highlight,
  pressed,
}: {
  readonly chosen: boolean
  readonly highlight: number | null
  readonly pressed: boolean
}) {
  return (
    <>
      <p className="flex items-center gap-1.5 text-[15px] font-semibold">
        <Sparkles
          aria-hidden
          className="size-4 text-[color:var(--app-accent)]"
        />
        AI Draft
      </p>
      <p className="mt-1 text-[13px] text-[color:var(--app-muted)]">
        Pick a template. We&rsquo;ll draft the post for you to review and edit
        before posting.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {templates.map((template, index) => {
          const lit = highlight === index
          return (
            <span
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors duration-150",
                lit
                  ? chosen
                    ? "border-[color:var(--app-accent)] bg-[color:var(--app-accent-soft)]"
                    : "border-[color:var(--app-rule)] bg-[color:var(--app-tag-bg)]"
                  : "border-[color:var(--app-rule)]"
              )}
              key={template.name}
            >
              <span className="text-[14px] font-medium">{template.name}</span>
              <span className="text-[12px] text-[color:var(--app-muted)]">
                {template.asks}
              </span>
            </span>
          )
        })}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <AppButton>Cancel</AppButton>
        <AppButton pressed={pressed} primary>
          Draft post
        </AppButton>
      </div>
    </>
  )
}

/**
 * Act 4's one component, for the reveal's card: the AI Draft picker, with the
 * term letter chosen.
 */
export function ComposerComponent() {
  return (
    <PanelSurface className="w-[480px] p-5">
      <DraftPickerBody chosen highlight={0} pressed={false} />
    </PanelSurface>
  )
}
