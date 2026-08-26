import { ChevronDown, FileText, Funnel, Search, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { defineScript, typedFrames, useDemoScript } from "./ga-demo-script"
import {
  AppButton,
  AppChip,
  AppInput,
  AppSelect,
  EASE_IN_OUT_CUBIC,
  EASE_OUT_QUART,
  Panel,
  PanelSurface,
  Screen,
  TrendArrow,
} from "./ga-screen-chrome"
import {
  CLASS_NAME,
  applyRules,
  filterFieldById,
  filterGroups,
  students,
} from "./ga-screen-data"

import type { AttentionTag, FilterField, FilterRule } from "./ga-screen-data"
import type { ScreenProps } from "./ga-screens"

type FieldId = FilterField["id"]

/** One rule row as the popover shows it — the field may still be unpicked. */
type RuleRow = {
  readonly field: FieldId | null
  /** What has been typed so far; "" is an empty box. */
  readonly value: string
}

type Picker = {
  /** Which rule row's field menu is open. */
  readonly row: number
  /** Which group the list has scrolled to. */
  readonly group: number
  readonly highlight: FieldId | null
}

type Step = {
  readonly pressed: boolean
  readonly open: boolean
  readonly rules: ReadonlyArray<RuleRow>
  readonly picker: Picker | null
}

const CLOSED: Step = { pressed: false, open: false, rules: [], picker: null }

const EMPTY_ROW: RuleRow = { field: null, value: "" }

function step(partial: Partial<Step>, base: Step): Step {
  return { ...base, ...partial }
}

/**
 * Act 1's timeline, on the reference's rhythm (paper.design, from the owner's
 * recording): a beat of the untouched screen, the panel opens, a menu opens
 * and its highlight walks to the choice, a value is typed a keystroke at a
 * time, the list behind answers — twice — and the pass ends on the frame the
 * owner's mockup shows, which is where it rests.
 */
const oneRule: Step = step(
  { open: true, rules: [{ field: "attendance", value: "" }] },
  CLOSED
)
const twoRules = (value: string): Step =>
  step(
    {
      rules: [
        { field: "attendance", value: "60" },
        { field: "socialLinks", value },
      ],
    },
    oneRule
  )
const SETTLED: Step = step(
  {
    rules: [...twoRules("1").rules, EMPTY_ROW],
    picker: { row: 2, group: 0, highlight: "ccaAttendance" },
  },
  oneRule
)

export const insightsScript = defineScript<Step>(12500, [
  [0, CLOSED],
  [900, step({ pressed: true }, CLOSED)],
  [1000, step({ open: true, rules: [EMPTY_ROW] }, CLOSED)],
  [
    1600,
    step(
      {
        open: true,
        rules: [EMPTY_ROW],
        picker: { row: 0, group: 0, highlight: null },
      },
      CLOSED
    ),
  ],
  [
    2000,
    step(
      {
        open: true,
        rules: [EMPTY_ROW],
        picker: { row: 0, group: 0, highlight: "late" },
      },
      CLOSED
    ),
  ],
  [
    2250,
    step(
      {
        open: true,
        rules: [EMPTY_ROW],
        picker: { row: 0, group: 0, highlight: "attendance" },
      },
      CLOSED
    ),
  ],
  [2600, oneRule],
  ...typedFrames(3100, "60", 160, (typed) =>
    step({ rules: [{ field: "attendance", value: typed }] }, oneRule)
  ),
  [
    4600,
    step({ rules: [{ field: "attendance", value: "60" }, EMPTY_ROW] }, oneRule),
  ],
  [
    5100,
    step(
      {
        rules: [{ field: "attendance", value: "60" }, EMPTY_ROW],
        picker: { row: 1, group: 1, highlight: null },
      },
      oneRule
    ),
  ],
  [
    5700,
    step(
      {
        rules: [{ field: "attendance", value: "60" }, EMPTY_ROW],
        picker: { row: 1, group: 1, highlight: "socialLinks" },
      },
      oneRule
    ),
  ],
  [6000, twoRules("")],
  [6500, twoRules("1")],
  [8000, SETTLED],
])

function appliedRules(
  rules: ReadonlyArray<RuleRow>
): ReadonlyArray<FilterRule> {
  return rules.flatMap((rule) =>
    rule.field !== null && rule.value !== ""
      ? [{ field: rule.field, value: Number(rule.value) }]
      : []
  )
}

const TAG_TONE: Record<AttentionTag, "grey" | "orange"> = {
  FAS: "grey",
  LTA: "grey",
  SwAN: "orange",
}

const COLUMNS =
  "grid-cols-[44px_204px_68px_100px_140px_124px_132px_124px_112px]"

const HEADERS: ReadonlyArray<{ label: string; sortable?: boolean }> = [
  { label: "#" },
  { label: "Name", sortable: true },
  { label: "Class", sortable: true },
  { label: "Criteria met" },
  { label: "Criteria tag" },
  { label: "CCA", sortable: true },
  { label: "Attention tag" },
  { label: "Attendance (%)", sortable: true },
  { label: "Late-coming (days)" },
]

/** Row height in the list; the menu's option and group-label heights. */
const ROW_H = "h-11"
const OPTION_H = 34
const GROUP_LABEL_H = 30
/** The menu's list box; the catalogue is taller, so it scrolls. */
const MENU_H = 232

/**
 * Act 1 — You identify. The class list, and the filter panel in front of it
 * narrowing it down. The panel sits left of the list, over the gutter, and
 * the list bleeds off the right of the page — the reference's composition.
 */
export function InsightsScreen({ active }: ScreenProps) {
  const current = useDemoScript(insightsScript, active)
  const applied = appliedRules(current.rules)
  const rows = applyRules(applied)
  const firstApplied = applied.at(0)

  return (
    <>
      {/* The list behind. */}
      <div className="absolute top-8 left-[var(--screen-x)] w-[1064px]">
        <Screen>
          <div
            className={`grid ${COLUMNS} h-10 items-center border-b border-[color:var(--app-rule)] px-2 text-[color:var(--app-muted)]`}
          >
            {HEADERS.map((header) => (
              <span className="flex items-center gap-1 px-2" key={header.label}>
                {header.label}
                {header.sortable ? (
                  <ChevronDown aria-hidden className="size-3" />
                ) : null}
              </span>
            ))}
          </div>
          <div className="flex h-9 items-center gap-2 border-b border-[color:var(--app-rule-soft)] bg-[color:var(--app-ground)] px-4 font-medium">
            <ChevronDown
              aria-hidden
              className="size-3.5 text-[color:var(--app-muted)]"
            />
            Class {CLASS_NAME}
            <span className="font-normal text-[color:var(--app-muted)]">
              ({students.length} students)
            </span>
          </div>
          <div className="relative">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((student, index) => {
                const criteriaTag =
                  firstApplied === undefined
                    ? null
                    : (filterFieldById.get(firstApplied.field)?.label ?? null)
                return (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className={`grid ${COLUMNS} ${ROW_H} items-center border-b border-[color:var(--app-rule-soft)] px-2`}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.2, ease: EASE_OUT_QUART },
                    }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    key={student.id}
                    layout
                    transition={{
                      layout: { duration: 0.3, ease: EASE_IN_OUT_CUBIC },
                      opacity: { duration: 0.2, ease: EASE_OUT_QUART },
                    }}
                  >
                    <span className="px-2 text-[color:var(--app-muted)]">
                      {index + 1}
                    </span>
                    <span className="flex items-center gap-1.5 truncate px-2">
                      {student.name}
                      <FileText
                        aria-hidden
                        className="size-3.5 shrink-0 text-[color:var(--app-muted)]"
                      />
                    </span>
                    <span className="px-2">{CLASS_NAME}</span>
                    <span className="px-2">
                      {applied.length === 0 ? "–" : applied.length}
                    </span>
                    <span className="px-2">
                      {criteriaTag === null ? (
                        <span className="text-[color:var(--app-muted)]">–</span>
                      ) : (
                        <AppChip tone="green">{criteriaTag}</AppChip>
                      )}
                    </span>
                    <span className="truncate px-2">{student.cca}</span>
                    <span className="flex gap-1 px-2">
                      {student.tags.length === 0 ? (
                        <span className="text-[color:var(--app-muted)]">
                          None
                        </span>
                      ) : (
                        student.tags.map((tag) => (
                          <AppChip key={tag} tone={TAG_TONE[tag]}>
                            {tag}
                          </AppChip>
                        ))
                      )}
                    </span>
                    <span className="flex items-center gap-1 px-2 tabular-nums">
                      {student.attendance}%
                      <TrendArrow trend={student.trend} />
                    </span>
                    <span className="px-2 tabular-nums">{student.late}</span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </Screen>
      </div>

      {/* The filter, in front. */}
      <div className="absolute top-14 left-0 z-10 w-[460px]">
        <AppButton pressed={current.pressed} className="h-9 rounded-[10px]">
          <Funnel aria-hidden className="size-3.5" />
          Filter
          {applied.length > 0 ? (
            <span className="ml-0.5 flex size-[18px] items-center justify-center rounded-full bg-[color:var(--app-accent)] text-[11px] leading-none font-semibold text-white tabular-nums">
              {applied.length}
            </span>
          ) : null}
        </AppButton>

        <AnimatePresence initial={false}>
          {current.open ? (
            <Panel className="mt-2 p-4" key="filter">
              <FilterBody
                picker={current.picker}
                rows={rows.length}
                rules={current.rules}
              />
            </Panel>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  )
}

function RuleLine({
  index,
  picker,
  rule,
  typing,
}: {
  readonly index: number
  readonly picker: Picker | null
  readonly rule: RuleRow
  readonly typing: boolean
}) {
  const field = rule.field === null ? null : filterFieldById.get(rule.field)
  return (
    <div className="flex items-center gap-2">
      <span className="w-11 shrink-0 text-[color:var(--app-muted)]">
        {index === 0 ? "Where" : "and"}
      </span>
      <span className="relative">
        <AppSelect
          className="w-[150px]"
          open={picker !== null}
          placeholder={field === null || field === undefined}
        >
          {field?.label ?? "Select filter"}
        </AppSelect>
        <AnimatePresence initial={false}>
          {picker !== null ? <FieldMenu key="menu" picker={picker} /> : null}
        </AnimatePresence>
      </span>
      {field !== null && field !== undefined ? (
        <>
          <AppSelect className="w-[108px]">less than</AppSelect>
          <AppInput
            className="w-[68px]"
            focused={typing}
            placeholder={rule.value === ""}
          >
            {rule.value === "" ? " " : rule.value}
          </AppInput>
          <X aria-hidden className="size-3.5 text-[color:var(--app-muted)]" />
        </>
      ) : null}
    </div>
  )
}

/**
 * The field menu: a search box and the catalogue by group. Switching group
 * slides the list (transform), the way the product's list scrolls.
 */
function FieldMenu({ picker }: { readonly picker: Picker }) {
  const groupHeight = (fields: number) => GROUP_LABEL_H + fields * OPTION_H
  const groupTop = filterGroups
    .slice(0, picker.group)
    .reduce((sum, group) => sum + groupHeight(group.fields.length), 0)
  const total = filterGroups.reduce(
    (sum, group) => sum + groupHeight(group.fields.length),
    0
  )
  // A real list cannot scroll past its end: the last group comes to rest at
  // the foot of the box with the groups above it still in view.
  const offset = Math.min(groupTop, Math.max(0, total - MENU_H))
  return (
    <Panel className="absolute top-[calc(100%+6px)] left-0 z-20 w-[380px] p-1.5">
      <AppInput
        className="w-full"
        focused
        icon={
          <Search
            aria-hidden
            className="size-3.5 text-[color:var(--app-muted)]"
          />
        }
        placeholder
      >
        Search options
      </AppInput>
      <div className="mt-1.5 overflow-hidden" style={{ height: MENU_H }}>
        <motion.div
          animate={{ y: -offset }}
          initial={false}
          transition={{ duration: 0.3, ease: EASE_IN_OUT_CUBIC }}
        >
          {filterGroups.map((group) => (
            <div key={group.label}>
              <p
                className="flex items-center px-2.5 text-[11px] leading-none font-semibold tracking-wide text-[color:var(--app-muted)] uppercase"
                style={{ height: GROUP_LABEL_H }}
              >
                {group.label}
              </p>
              {group.fields.map((field) => (
                <p
                  className={`flex items-center rounded-md px-2.5 transition-colors duration-150 ${
                    picker.highlight === field.id
                      ? "bg-[color:var(--app-tag-bg)]"
                      : ""
                  }`}
                  key={field.id}
                  style={{ height: OPTION_H }}
                >
                  {field.label}
                </p>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </Panel>
  )
}

/**
 * What the popover says: how many records the rules leave, and the rules. Used
 * by the screen inside its animated `Panel`, and by the reveal's card at rest.
 */
function FilterBody({
  picker,
  rows,
  rules,
}: {
  readonly picker: Picker | null
  readonly rows: number
  readonly rules: ReadonlyArray<RuleRow>
}) {
  return (
    <>
      <p className="font-semibold">
        Show records{" "}
        <span className="font-normal text-[color:var(--app-muted)]">
          ({rows} of {students.length} found)
        </span>
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {rules.map((rule, index) => (
          <RuleLine
            index={index}
            key={index}
            picker={picker?.row === index ? picker : null}
            rule={rule}
            typing={false}
          />
        ))}
      </div>
    </>
  )
}

/**
 * Act 1's one component, for the reveal's card: the filter itself — not the
 * whole screen shrunk to nothing (owner, 2026-08-26). Shown at the frame the
 * demonstration rests on, which is also the frame of the owner's mockup: both
 * cuts applied and the options menu open. That state is nearly square, so it
 * fills the card, where the two rule rows alone would sit as a thin band.
 *
 * The bottom padding is the menu's room: the menu hangs out of the panel it
 * belongs to (it is positioned against its select, as a real one is), and the
 * card clips whatever leaves the surface.
 */
export function InsightsComponent() {
  const rules = SETTLED.rules
  return (
    <PanelSurface className="w-[460px] p-4 pb-[300px]">
      <FilterBody
        picker={SETTLED.picker}
        rows={applyRules(appliedRules(rules)).length}
        rules={rules}
      />
    </PanelSurface>
  )
}
