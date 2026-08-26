import { ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "motion/react"

import type { Trend } from "./ga-screen-data"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * The product's visual language, as primitives for the journey's coded
 * screens (owner, 2026-08-26, after paper.design). Read off the prototype
 * captures rather than invented: white surfaces on a grey ground, 1px
 * hairlines, 8–12px radii, Inter at 13px, chips at 12px. Everything here is
 * decorative — the screens perform, they are not controls — so nothing takes
 * focus or exposes a role; the act's copy and an sr-only description carry
 * the meaning.
 *
 * Motion follows the blueprint: things entering or leaving ease out
 * (`EASE_OUT_QUART`), things already on screen that move ease in-out
 * (`EASE_IN_OUT_CUBIC`), and only transform and opacity ever animate.
 */

export const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const
export const EASE_IN_OUT_CUBIC = [0.645, 0.045, 0.355, 1] as const

/** Enter/exit timing for a floating panel or dropdown. */
export const PANEL_ENTER = { duration: 0.2, ease: EASE_OUT_QUART } as const
export const PANEL_EXIT = { duration: 0.15, ease: EASE_OUT_QUART } as const

/**
 * The look of a floating layer, shared by the animated `Panel` and the still
 * `PanelSurface`. The reveal's cards show one panel each, unanimated, so the
 * surface has to exist apart from the entrance.
 */
const PANEL_SURFACE =
  "rounded-xl border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] font-body text-[13px] leading-5 text-[color:var(--app-ink)] antialiased shadow-[var(--app-shadow-panel)]"

/** A floating layer at rest — no entrance, for a still. */
export function PanelSurface({
  children,
  className,
}: {
  readonly children: ReactNode
  readonly className?: string
}) {
  return <div className={cn(PANEL_SURFACE, className)}>{children}</div>
}

/** A screen of the product: the surface everything else sits on. */
export function Screen({
  children,
  className,
}: {
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] font-body text-[13px] leading-5 text-[color:var(--app-ink)] antialiased shadow-[var(--app-shadow-screen)]",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * A floating layer — the popover, the picker, the guidance card. Mounted
 * only while open, so a closed panel never server-renders as `opacity:0`;
 * the parent's `AnimatePresence` gives it its entrance and exit.
 */
export function Panel({
  children,
  className,
}: {
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className={cn(PANEL_SURFACE, "will-change-transform", className)}
      exit={{ opacity: 0, scale: 0.96, transition: PANEL_EXIT }}
      initial={{ opacity: 0, scale: 0.96 }}
      style={{ transformOrigin: "top left" }}
      transition={PANEL_ENTER}
    >
      {children}
    </motion.div>
  )
}

/** A button as the product draws it. `pressed` plays the press. */
export function AppButton({
  children,
  className,
  pressed = false,
  primary = false,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly pressed?: boolean
  readonly primary?: boolean
}) {
  return (
    <motion.span
      animate={{ scale: pressed ? 0.97 : 1 }}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] leading-none font-medium",
        primary
          ? "border-transparent bg-[color:var(--app-accent)] text-white"
          : "border-[color:var(--app-rule)] bg-[color:var(--app-surface)] text-[color:var(--app-ink)]",
        className
      )}
      initial={false}
      transition={{ duration: 0.12, ease: EASE_OUT_QUART }}
    >
      {children}
    </motion.span>
  )
}

export type ChipTone = "grey" | "green" | "orange" | "blue"

const CHIP_TONE: Record<ChipTone, string> = {
  grey: "bg-[color:var(--app-tag-bg)] text-[color:var(--app-ink)]",
  green:
    "bg-[color:var(--app-tag-green-bg)] text-[color:var(--app-tag-green-ink)]",
  orange:
    "bg-[color:var(--app-tag-orange-bg)] text-[color:var(--app-tag-orange-ink)] ring-1 ring-inset ring-[color:var(--app-tag-orange-ink)]/30",
  blue: "bg-[color:var(--app-accent-soft)] text-[color:var(--app-accent-ink)]",
}

/** The small pill the product uses for tags and states. */
export function AppChip({
  children,
  className,
  tone = "grey",
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly tone?: ChipTone
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full px-2 text-[11px] leading-none font-medium whitespace-nowrap",
        CHIP_TONE[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

/** A select trigger. `open` flips the chevron; the menu is the caller's. */
export function AppSelect({
  children,
  className,
  open = false,
  placeholder = false,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly open?: boolean
  readonly placeholder?: boolean
}) {
  const Chevron = open ? ChevronUp : ChevronDown
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center justify-between gap-2 rounded-[10px] border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] px-3 text-[13px] leading-none whitespace-nowrap",
        placeholder
          ? "text-[color:var(--app-muted)]"
          : "text-[color:var(--app-ink)]",
        className
      )}
    >
      <span className="truncate">{children}</span>
      <Chevron
        aria-hidden
        className="size-3.5 shrink-0 text-[color:var(--app-muted)]"
      />
    </span>
  )
}

/** A text field. `focused` draws the product's blue ring. */
export function AppInput({
  children,
  className,
  focused = false,
  icon,
  placeholder = false,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly focused?: boolean
  readonly icon?: ReactNode
  readonly placeholder?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-[10px] border bg-[color:var(--app-surface)] px-3 text-[13px] leading-none whitespace-nowrap transition-[box-shadow,border-color] duration-150",
        focused
          ? "border-[color:var(--app-accent)] shadow-[0_0_0_3px_var(--app-accent-soft)]"
          : "border-[color:var(--app-rule)]",
        placeholder
          ? "text-[color:var(--app-muted)]"
          : "text-[color:var(--app-ink)]",
        className
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  )
}

/**
 * Glyphs, not icons: a list draws one of these per row, and fourteen
 * three-node SVGs were a measurable share of the style-and-layout cost the
 * screens added to the page. Text costs one node.
 */
const TREND: Record<Trend, { glyph: string; className: string }> = {
  up: { glyph: "↗", className: "text-[color:var(--app-trend-up)]" },
  down: { glyph: "↘", className: "text-[color:var(--app-trend-down)]" },
  flat: { glyph: "—", className: "text-[color:var(--app-muted)]" },
}

export function TrendArrow({ trend }: { readonly trend: Trend }) {
  const { glyph, className } = TREND[trend]
  return (
    <span aria-hidden className={cn("text-[12px] leading-none", className)}>
      {glyph}
    </span>
  )
}

/**
 * Where a profile section's content would be: bars, never values. This is
 * how Behaviour and Family stay inside the product on the public page.
 */
export function Redaction({
  className,
  widths = ["70%", "45%"],
}: {
  readonly className?: string
  readonly widths?: ReadonlyArray<string>
}) {
  return (
    <span aria-hidden className={cn("flex flex-col gap-2", className)}>
      {widths.map((width, index) => (
        <span
          className="block h-2.5 rounded-sm bg-[color:var(--app-rule-soft)]"
          key={index}
          style={{ width }}
        />
      ))}
    </span>
  )
}

/** The blue outline the product draws around a selected row. */
export function selectionRing(selected: boolean): string {
  return selected
    ? "shadow-[inset_0_0_0_1.5px_var(--app-selection)]"
    : "shadow-none"
}
