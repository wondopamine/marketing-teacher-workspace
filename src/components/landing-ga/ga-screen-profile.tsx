import {
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  Heart,
  Info,
  User,
  Users,
} from "lucide-react"
import { motion } from "motion/react"

import { defineScript, useDemoScript } from "./ga-demo-script"
import {
  EASE_IN_OUT_CUBIC,
  PanelSurface,
  Redaction,
  Screen,
} from "./ga-screen-chrome"
import { profile, profileSections } from "./ga-screen-data"

import type { ProfileSection } from "./ga-screen-data"
import type { ScreenProps } from "./ga-screens"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * The profile page's geometry, fixed so the rail can scroll to a section by
 * arithmetic: header card, then one card per section, 16px apart. Fixed
 * heights (with the cards clipping their own content) are what make the
 * scroll target knowable without measuring.
 */
const HEADER_H = 104
const GAP = 16
const PAD_TOP = 24
const CARD_H: Record<ProfileSection, number> = {
  Attendance: 212,
  Behaviour: 148,
  Wellbeing: 186,
  Academic: 148,
  Family: 148,
}

/** Where a section's card starts, from the top of the scrolling pane. */
function sectionTop(section: ProfileSection): number {
  let top = PAD_TOP + HEADER_H + GAP
  for (const candidate of profileSections) {
    if (candidate === section) return top
    top += CARD_H[candidate] + GAP
  }
  return top
}

/** How far the pane scrolls to bring a section to just under the top bar. */
export function scrollTo(section: ProfileSection | null): number {
  return section === null ? 0 : -(sectionTop(section) - PAD_TOP)
}

type Step = {
  /** The rail's lit entry. */
  readonly highlight: ProfileSection | null
  /** The section the pane has scrolled to; null is the top of the page. */
  readonly target: ProfileSection | null
}

/**
 * Act 2's timeline: the page at its head, then the rail takes it to
 * Attendance, Wellbeing, Academic, and back to the head — where it rests with
 * Attendance lit, the section a teacher opens first.
 */
export const profileScript = defineScript<Step>(10000, [
  [0, { highlight: null, target: null }],
  [1000, { highlight: "Attendance", target: "Attendance" }],
  [3400, { highlight: "Wellbeing", target: "Wellbeing" }],
  [5800, { highlight: "Academic", target: "Academic" }],
  [8200, { highlight: "Attendance", target: null }],
])

/** Act 2 — You understand. The profile, and the rail that moves through it. */
export function ProfileScreen({ active }: ScreenProps) {
  const current = useDemoScript(profileScript, active)
  return (
    <>
      <ProfileBackground target={current.target} />
      <JumpRail highlight={current.highlight} />
    </>
  )
}

/**
 * The profile page itself, scrolled to `target`. Shared with act 3, which
 * dims it behind the guidance panel.
 */
export function ProfileBackground({
  className,
  target,
}: {
  readonly className?: string
  readonly target: ProfileSection | null
}) {
  return (
    <div
      className={cn(
        "absolute top-8 left-[var(--screen-x)] w-[880px]",
        className
      )}
    >
      <Screen className="h-[640px] bg-[color:var(--app-ground)]">
        <div className="flex h-12 items-center justify-between border-b border-[color:var(--app-rule)] bg-[color:var(--app-surface)] px-5 text-[color:var(--app-muted)]">
          <span className="flex items-center gap-2">
            Home
            <ChevronRight aria-hidden className="size-3.5" />
            Profile
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-[color:var(--app-ink)]">{profile.name}</span>
          </span>
          <span className="flex items-center gap-3">
            <Bell aria-hidden className="size-4" />
            <span className="flex size-7 items-center justify-center rounded-full bg-[color:var(--app-accent)] text-[12px] font-semibold text-white">
              D
            </span>
          </span>
        </div>
        <div className="relative h-[592px] overflow-hidden">
          <motion.div
            animate={{ y: scrollTo(target) }}
            className="absolute inset-x-0 top-0 flex flex-col px-10 will-change-transform"
            initial={false}
            style={{ paddingTop: PAD_TOP, gap: GAP }}
            transition={{ duration: 0.4, ease: EASE_IN_OUT_CUBIC }}
          >
            <Card className="flex items-center gap-4" height={HEADER_H}>
              <span className="flex size-14 items-center justify-center rounded-full bg-[color:var(--app-tag-bg)] text-[color:var(--app-muted)]">
                <User aria-hidden className="size-6" />
              </span>
              <span>
                <span className="block text-[19px] leading-6 font-semibold">
                  {profile.name}
                </span>
                <span className="block text-[14px] text-[color:var(--app-muted)]">
                  Class {profile.className} · {profile.cca}
                </span>
              </span>
            </Card>

            <Card height={CARD_H.Attendance}>
              <CardTitle
                icon={<Calendar aria-hidden className="size-4" />}
                tint="amber"
              >
                Attendance
              </CardTitle>
              <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-4">
                {Object.values(profile.attendance).map((metric) => (
                  <Metric
                    key={metric.label}
                    label={metric.label}
                    note={"note" in metric ? metric.note : undefined}
                    trend={"trend" in metric ? metric.trend : undefined}
                    value={metric.value}
                  />
                ))}
              </div>
            </Card>

            <Card height={CARD_H.Behaviour}>
              <CardTitle
                icon={<BookOpen aria-hidden className="size-4" />}
                tint="blue"
              >
                Behaviour
              </CardTitle>
              <RedactedGrid />
            </Card>

            <Card height={CARD_H.Wellbeing}>
              <CardTitle
                icon={<Heart aria-hidden className="size-4" />}
                tint="green"
              >
                Wellbeing
              </CardTitle>
              <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-4">
                <Metric
                  label="Social links"
                  value={String(profile.socialLinks)}
                />
                <Redaction className="pt-1" widths={["80%", "40%"]} />
                <Redaction className="pt-1" widths={["70%", "35%"]} />
              </div>
            </Card>

            <Card height={CARD_H.Academic}>
              <CardTitle
                icon={<GraduationCap aria-hidden className="size-4" />}
                tint="blue"
              >
                Academic
              </CardTitle>
              <RedactedGrid />
            </Card>

            <Card height={CARD_H.Family}>
              <CardTitle
                icon={<Users aria-hidden className="size-4" />}
                tint="amber"
              >
                Family
              </CardTitle>
              <RedactedGrid />
            </Card>
          </motion.div>
        </div>
      </Screen>
    </div>
  )
}

/** The floating "Jump to" rail, in front of the page. */
function JumpRail({
  highlight,
}: {
  readonly highlight: ProfileSection | null
}) {
  return (
    <PanelSurface className="absolute top-20 left-0 z-10 w-[236px] p-3">
      <RailBody highlight={highlight} />
    </PanelSurface>
  )
}

/**
 * Act 2's one component, for the reveal's card: the rail that names every
 * section of a student's record — which is what "holistically" means here.
 */
export function ProfileComponent() {
  return (
    <PanelSurface className="w-[236px] p-3">
      <RailBody highlight="Attendance" />
    </PanelSurface>
  )
}

function RailBody({
  highlight,
}: {
  readonly highlight: ProfileSection | null
}) {
  return (
    <>
      <p className="px-1 text-[color:var(--app-muted)]">Jump to</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {profileSections.map((section) => (
          <span
            className={cn(
              "flex h-9 items-center rounded-lg px-3 text-[14px] transition-colors duration-200",
              highlight === section
                ? "bg-[color:var(--app-accent-soft)] font-medium text-[color:var(--app-accent-ink)]"
                : "bg-[color:var(--app-tag-bg)]"
            )}
            key={section}
          >
            {section}
          </span>
        ))}
      </div>
    </>
  )
}

function Card({
  children,
  className,
  height,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly height: number
}) {
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-xl border border-[color:var(--app-rule)] bg-[color:var(--app-surface)] px-6 py-5",
        className
      )}
      style={{ height }}
    >
      {children}
    </div>
  )
}

const TINT = {
  amber: "bg-[#fdf3c4] text-[#b45309]",
  blue: "bg-[#e3ecff] text-[color:var(--app-accent)]",
  green: "bg-[#e3f5e8] text-[#15803d]",
} as const

function CardTitle({
  children,
  icon,
  tint,
}: {
  readonly children: ReactNode
  readonly icon: ReactNode
  readonly tint: keyof typeof TINT
}) {
  return (
    <p className="flex items-center gap-3 text-[17px] leading-6 font-semibold">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          TINT[tint]
        )}
      >
        {icon}
      </span>
      {children}
    </p>
  )
}

function Metric({
  label,
  note,
  trend,
  value,
}: {
  readonly label: string
  readonly note?: string
  readonly trend?: "up" | "down" | "flat"
  readonly value: string
}) {
  return (
    <span className="block">
      <span className="flex items-center gap-1 text-[14px] text-[color:var(--app-muted)]">
        {label}
        <Info aria-hidden className="size-3.5" />
      </span>
      <span className="mt-1 flex items-center gap-1 text-[15px] tabular-nums">
        {value}
        {trend === "up" ? (
          <span aria-hidden className="text-[color:var(--app-trend-up)]">
            ↗
          </span>
        ) : null}
        {trend === "down" ? (
          <span aria-hidden className="text-[color:var(--app-trend-down)]">
            ↘
          </span>
        ) : null}
        {note !== undefined ? (
          <span className="text-[color:var(--app-muted)]">{note}</span>
        ) : null}
      </span>
    </span>
  )
}

/** Three redacted metrics, where a section's values would be. */
function RedactedGrid() {
  return (
    <div className="mt-5 grid grid-cols-3 gap-x-6">
      <Redaction widths={["75%", "40%"]} />
      <Redaction widths={["65%", "30%"]} />
      <Redaction widths={["70%", "45%"]} />
    </div>
  )
}
