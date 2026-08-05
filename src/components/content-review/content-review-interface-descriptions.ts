export type ContentReviewInterfaceDescription = {
  readonly heading: string
  readonly body: string
  readonly keyElements: ReadonlyArray<string>
}

type ContentReviewInterfaceDescriptions = {
  readonly hero: ContentReviewInterfaceDescription
  readonly story: readonly [
    ContentReviewInterfaceDescription,
    ContentReviewInterfaceDescription,
    ContentReviewInterfaceDescription,
    ContentReviewInterfaceDescription,
    ContentReviewInterfaceDescription,
  ]
  readonly explorer: readonly [
    ContentReviewInterfaceDescription,
    ContentReviewInterfaceDescription,
    ContentReviewInterfaceDescription,
  ]
}

export const contentReviewInterfaceDescriptions = {
  hero: {
    heading: "Connected positive-growth view",
    body: "Help teachers see what is going well and decide what to do next for a synthetic class student. Keep recent observations, a possible next step, and a family message together.",
    keyElements: [
      "Positive growth · Growing confidence tag",
      "Recent observation summary",
      "Next step, message draft, and Posts",
    ],
  },
  story: [
    {
      heading: "Positive student profile",
      body: "Help teachers recognise a student’s progress at a glance. Use a synthetic student from the general class list, highlight the positive-growth tag, and show no additional-needs or attention tag.",
      keyElements: [
        "Synthetic student and class",
        "Positive growth · Growing confidence tag",
        "Latest teacher observation",
      ],
    },
    {
      heading: "Evidence behind the positive tag",
      body: "Make the positive tag traceable to recent classroom evidence. Show a short timeline of notes that makes the student’s growing confidence easy to recognise, without risk or support indicators.",
      keyElements: [
        "Two or three synthetic observations",
        "Positive tag remains visible",
        "Teacher note source labels",
      ],
    },
    {
      heading: "Teacher-controlled next-step guidance",
      body: "Help the teacher turn positive evidence into a small next step. Suggest one low-stakes way to invite another contribution, with the supporting observations beside it for review.",
      keyElements: [
        "Suggested action",
        "Why it may help",
        "Review or adapt state",
      ],
    },
    {
      heading: "Editable family message",
      body: "Help the teacher prepare a family update without losing control of the wording. Show a short draft built from the positive evidence and mark it as editable and awaiting review.",
      keyElements: [
        "Draft family update",
        "Supporting context",
        "Review and edit state",
      ],
    },
    {
      heading: "Posts preview and student record",
      body: "Help the teacher check what will be shared and where it will be recorded. Show the reviewed family update beside its place in the student record and keep the preview visibly unsent.",
      keyElements: [
        "Posts preview",
        "Family audience",
        "Student communication timeline",
      ],
    },
  ],
  explorer: [
    {
      heading: "Positive scenario picker",
      body: "Let teachers start with a constructive classroom moment. Offer only synthetic examples and preselect “Contributing more in class” for this walkthrough.",
      keyElements: [
        "Selected positive scenario",
        "Synthetic example marker",
        "Capabilities included",
      ],
    },
    {
      heading: "Connected student context",
      body: "Help teachers review the evidence and next step together. Bring the positive tag, supporting observations, and possible next step into one view.",
      keyElements: [
        "Positive tag",
        "Observation timeline",
        "Suggested next step",
      ],
    },
    {
      heading: "Teacher review before sharing",
      body: "Let teachers keep control of what reaches a family. Show the editable message and Posts preview together, and keep both unsent until the teacher approves them.",
      keyElements: ["Editable message", "Posts preview", "Preview-only status"],
    },
  ],
} as const satisfies ContentReviewInterfaceDescriptions
