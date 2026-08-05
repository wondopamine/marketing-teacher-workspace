export type ContentReviewInterfaceDescription = {
  readonly heading: string
  readonly body: string
  readonly keyElements: readonly [string, string, string]
}

type ContentReviewInterfaceDescriptions = {
  readonly hero: ContentReviewInterfaceDescription
  readonly journey: readonly [
    ContentReviewInterfaceDescription,
    ContentReviewInterfaceDescription,
    ContentReviewInterfaceDescription,
  ]
}

export const contentReviewInterfaceDescriptions = {
  hero: {
    heading: "Class progress and next-step workspace",
    body: "Bring the class overview, progress, next step, and family update into one reviewable workspace.",
    keyElements: [
      "Synthetic general-class student selected",
      "Prominent Growing confidence progress",
      "Observations, next step, and unsent update together",
    ],
  },
  journey: [
    {
      heading: "Class progress view",
      body: "Show positive classroom observations for Student A without introducing a risk or support classification.",
      keyElements: [
        "Student A · Primary 4",
        "Growing confidence positive tag",
        "Two recent positive observations",
      ],
    },
    {
      heading: "Next-step review",
      body: "Give the teacher one low-stakes suggestion with its classroom context and a clear review state.",
      keyElements: [
        "Suggested short contribution",
        "Reason tied to observations",
        "Review or adapt state",
      ],
    },
    {
      heading: "Family update and record",
      body: "Keep a teacher-editable family draft beside its not-shared Posts preview and communication timeline.",
      keyElements: [
        "Editable family update draft",
        "Posts preview remains not shared",
        "Student communication timeline",
      ],
    },
  ],
} as const satisfies ContentReviewInterfaceDescriptions
