/**
 * The one synthetic class the journey's screens share.
 *
 * Every person, tag and number here is invented for the public page — the
 * round-3 privacy posture (2026-08-21) survives the move from vignettes to
 * full screens (owner, 2026-08-26) because nothing on screen is captured
 * from the product: it is all authored here, and the filter is computed from
 * this data so every count the demo shows is true of the rows on screen.
 *
 * No attention tags — they are not in GA. No SEN either, and nothing from
 * the Behaviour or Family sections of a profile appears in any screen: those
 * sections render as headers and redaction bars only.
 */

export type Trend = "up" | "down" | "flat"

export type Student = {
  readonly id: string
  readonly name: string
  readonly cca: string
  /** Attendance this term, %. */
  readonly attendance: number
  readonly trend: Trend
  /** Late-coming, days. */
  readonly late: number
  /** Non-VR absences, days. */
  readonly nonVr: number
  /** Private VR absences, days. */
  readonly privateVr: number
  /** MC absences, days. */
  readonly mc: number
  /** CCA attendance, %. */
  readonly ccaAttendance: number
  /** Recorded peer connections. */
  readonly socialLinks: number
}

export const CLASS_NAME = "4A"

/**
 * Fourteen students. Seven sit under 60% attendance, and three of those have
 * no recorded social links — the two cuts act 1's demo makes, in that order,
 * so it lands on "7 of 14" and then "3 of 14".
 */
export const students: ReadonlyArray<Student> = [
  {
    id: "s01",
    name: "Aaliyah Binte Rashid",
    cca: "Volleyball",
    attendance: 40,
    trend: "up",
    late: 3,
    nonVr: 14,
    privateVr: 2,
    mc: 1,
    ccaAttendance: 55,
    socialLinks: 0,
  },
  {
    id: "s02",
    name: "Brandon Lee Jun Wei",
    cca: "Red Cross",
    attendance: 81,
    trend: "down",
    late: 5,
    nonVr: 3,
    privateVr: 1,
    mc: 2,
    ccaAttendance: 90,
    socialLinks: 4,
  },
  {
    id: "s03",
    name: "Chloe Ng Xin Yi",
    cca: "Red Cross",
    attendance: 57,
    trend: "up",
    late: 14,
    nonVr: 9,
    privateVr: 0,
    mc: 3,
    ccaAttendance: 70,
    socialLinks: 2,
  },
  {
    id: "s04",
    name: "Darren Koh Jia Hao",
    cca: "Robotics",
    attendance: 70,
    trend: "down",
    late: 10,
    nonVr: 6,
    privateVr: 1,
    mc: 1,
    ccaAttendance: 82,
    socialLinks: 3,
  },
  {
    id: "s05",
    name: "Farah Nur Aisyah",
    cca: "Badminton",
    attendance: 85,
    trend: "flat",
    late: 5,
    nonVr: 2,
    privateVr: 0,
    mc: 2,
    ccaAttendance: 96,
    socialLinks: 5,
  },
  {
    id: "s06",
    name: "Gabriel Tan Yi Xuan",
    cca: "Concert Band",
    attendance: 72,
    trend: "down",
    late: 9,
    nonVr: 5,
    privateVr: 2,
    mc: 1,
    ccaAttendance: 88,
    socialLinks: 3,
  },
  {
    id: "s07",
    name: "Hannah Lim Hui Ling",
    cca: "Basketball",
    attendance: 52,
    trend: "down",
    late: 6,
    nonVr: 11,
    privateVr: 1,
    mc: 4,
    ccaAttendance: 61,
    socialLinks: 0,
  },
  {
    id: "s08",
    name: "Ishaan Pillai",
    cca: "Choir",
    attendance: 64,
    trend: "up",
    late: 12,
    nonVr: 7,
    privateVr: 0,
    mc: 2,
    ccaAttendance: 79,
    socialLinks: 2,
  },
  {
    id: "s09",
    name: "Jasmine Ong Mei Qi",
    cca: "Drama",
    attendance: 48,
    trend: "down",
    late: 15,
    nonVr: 12,
    privateVr: 3,
    mc: 2,
    ccaAttendance: 58,
    socialLinks: 1,
  },
  {
    id: "s10",
    name: "Kavya Ramasamy",
    cca: "Scouts",
    attendance: 89,
    trend: "up",
    late: 2,
    nonVr: 1,
    privateVr: 0,
    mc: 1,
    ccaAttendance: 94,
    socialLinks: 6,
  },
  {
    id: "s11",
    name: "Lucas Chua Zhi Hao",
    cca: "Football",
    attendance: 59,
    trend: "flat",
    late: 8,
    nonVr: 10,
    privateVr: 1,
    mc: 2,
    ccaAttendance: 74,
    socialLinks: 1,
  },
  {
    id: "s12",
    name: "Megan Toh Shu Fen",
    cca: "Swimming",
    attendance: 94,
    trend: "up",
    late: 1,
    nonVr: 1,
    privateVr: 0,
    mc: 0,
    ccaAttendance: 98,
    socialLinks: 5,
  },
  {
    id: "s13",
    name: "Nadia Binte Hamid",
    cca: "Guzheng",
    attendance: 45,
    trend: "down",
    late: 11,
    nonVr: 13,
    privateVr: 2,
    mc: 3,
    ccaAttendance: 52,
    socialLinks: 0,
  },
  {
    id: "s14",
    name: "Owen Yeo Kai Wen",
    cca: "Table Tennis",
    attendance: 55,
    trend: "up",
    late: 7,
    nonVr: 10,
    privateVr: 1,
    mc: 1,
    ccaAttendance: 66,
    socialLinks: 2,
  },
]

/** A field the filter can cut on, and the column it reads. */
export type FilterField = {
  readonly id: keyof Pick<
    Student,
    | "attendance"
    | "late"
    | "nonVr"
    | "privateVr"
    | "mc"
    | "ccaAttendance"
    | "socialLinks"
  >
  readonly label: string
}

export type FilterGroup = {
  readonly label: string
  readonly fields: ReadonlyArray<FilterField>
}

/** The picker's catalogue, grouped the way the product groups it. */
export const filterGroups: ReadonlyArray<FilterGroup> = [
  {
    label: "Attendance",
    fields: [
      { id: "attendance", label: "Attendance (%)" },
      { id: "late", label: "Late-coming (days)" },
      { id: "nonVr", label: "Non-VR absences (days)" },
      { id: "privateVr", label: "Private VR absences (days)" },
      { id: "mc", label: "MC absences (days)" },
      { id: "ccaAttendance", label: "CCA attendance (%)" },
    ],
  },
  {
    label: "Wellbeing",
    fields: [{ id: "socialLinks", label: "Social links" }],
  },
]

export const filterFieldById: ReadonlyMap<FilterField["id"], FilterField> =
  new Map(filterGroups.flatMap((group) => group.fields.map((f) => [f.id, f])))

/** One rule row in the filter: `field` `less than` `value`. */
export type FilterRule = {
  readonly field: FilterField["id"]
  readonly value: number
}

export function matchesRule(student: Student, rule: FilterRule): boolean {
  return student[rule.field] < rule.value
}

export function matchesAll(
  student: Student,
  rules: ReadonlyArray<FilterRule>
): boolean {
  return rules.every((rule) => matchesRule(student, rule))
}

/** The rows a set of rules leaves on screen, in class order. */
export function applyRules(
  rules: ReadonlyArray<FilterRule>
): ReadonlyArray<Student> {
  return students.filter((student) => matchesAll(student, rules))
}

/**
 * The profile act 2 opens. Rachel's attendance reads 93% and rising, the
 * figure act 3's suggestion reasons about, and her CCA attendance 60% and
 * falling, so the two lines move in opposite directions the way a real record
 * does; nothing from Behaviour or Family is here.
 */
export const profile = {
  name: "Rachel Wong Mei Ling",
  className: "3B",
  cca: "Swimming",
  attendance: {
    attendance: { label: "Attendance (%)", value: "93", trend: "up" as Trend },
    nonVr: { label: "Non-VR absences (days)", value: "0" },
    privateVr: { label: "Private VR absences (days)", value: "0" },
    late: { label: "Late-coming (days)", value: "1" },
    mc: { label: "MC absences (days)", value: "1" },
    ccaAttendance: {
      label: "CCA attendance (%)",
      value: "60%",
      trend: "down" as Trend,
      note: "(Swimming)",
    },
  },
  socialLinks: 4,
} as const

export const profileSections = [
  "Attendance",
  "Behaviour",
  "Wellbeing",
  "Academic",
  "Family",
] as const

export type ProfileSection = (typeof profileSections)[number]
