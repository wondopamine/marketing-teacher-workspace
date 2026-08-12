import "@tanstack/react-start/server-only"

import {
  cmsPageSchemaVersion,
  cmsReviewSchemaVersion,
  cmsSectionLibraryVersion,
} from "../document"

import type { CmsVersionContract } from "../document"

export const cmsHomepagePageId = "b7a1e972-1758-4815-87b9-9697a324a667"
export const cmsHomepageImportAttemptId = "2f0cc277-91aa-4c30-9070-cd8a755cb90f"

export const homepageV1Contract = {
  pageSchemaVersion: cmsPageSchemaVersion,
  reviewSchemaVersion: cmsReviewSchemaVersion,
  sectionLibraryVersion: cmsSectionLibraryVersion,
  pageDocument: {
    page: {
      title:
        "Teacher Workspace | Every student gets the support they qualify for",
      path: "/",
      description:
        "Teacher Workspace puts a student's full picture in one place, shows you what to do next, and keeps your message to the family on the record.",
      brand: "Teacher Workspace",
    },
    sections: [
      {
        id: "02e79e5c-bd01-47e5-be54-95b7c939c358",
        type: "promise",
        state: "visible",
        fields: {
          eyebrow: null,
          heading: "Every student gets the support they qualify for",
          body: [
            "You see the first sign of eligibility, you help the family apply, and all of it stays on the student's record in one place.",
          ],
          action: {
            label: "Sign in with Google",
            note: "Use your @edu.gov.sg account.",
          },
          screen: {
            id: "7d2140d1-15e7-4762-b3b3-17e261c85948",
            src: "/content-review/screens/student-profile.png",
            alt: "Teacher Workspace student profile with attendance, behaviour, wellbeing, and family navigation.",
            breadcrumb: ["Student Insights", "Student profile"],
          },
        },
      },
      {
        id: "e4a6a36b-bb0a-4977-854b-66f3db071123",
        type: "connected-story",
        state: "visible",
        fields: {
          heading: "One student, carried through every moment",
          steps: [
            {
              id: "6561cfb1-bcd0-46e5-a322-7b8ea96ee6cb",
              label: "A student in your class",
              heading: "Xiao Ming is one of thirty-two students you teach.",
              body: [
                "His family's circumstances changed last term. The signs sit in separate systems, and none of them raises a hand.",
              ],
              screen: {
                id: "74176ccd-fdee-47a2-9308-286146f2366b",
                src: "/content-review/screens/student-insights-class.png",
                alt: "Teacher Workspace Student Insights table for a Secondary 3 class.",
                breadcrumb: ["Student Insights", "Class 3A"],
              },
            },
            {
              id: "649d7311-7b87-4efb-8daa-893b4388481e",
              label: "You notice",
              heading:
                "Xiao Ming's family may qualify for support. Nobody has applied.",
              body: [
                "His profile shows a sibling already receiving financial assistance, household circumstances updated last term, and no bursary on file. You are reading this while the application window is still open.",
              ],
              screen: {
                id: "9618e896-adda-4973-95e0-61c45360a2f5",
                src: "/content-review/screens/student-profile-family.png",
                alt: "Family section of a synthetic student profile in Teacher Workspace.",
                breadcrumb: ["Student Insights", "Student profile", "Family"],
              },
            },
            {
              id: "9d0ccaad-0ad7-45e4-a98b-2c6a4bc8a95b",
              label: "You know the steps",
              heading: "The right bursary, and what it needs from the family.",
              body: [
                "His profile names the scheme that fits his situation, the documents the family has to produce, where to submit them, and when the window closes. You do not have to work through the circulars or ask the teacher down the corridor.",
              ],
              screen: {
                id: "f050b81e-c800-4013-9258-57d991041363",
                src: "/content-review/screens/guidance.png",
                alt: "Teacher Workspace student-support guidance opened from a recommended action.",
                breadcrumb: [
                  "Student Insights",
                  "Student profile",
                  "Recommended action",
                  "Guidance",
                ],
              },
            },
            {
              id: "22bf511c-0da0-48c7-90e1-7028f8d0e49f",
              label: "The words are ready",
              heading: "A clear message, already drafted.",
              body: [
                "Telling a family they may qualify for support is a delicate note to write. The draft starts from his context and your tone, with the steps and documents set out plainly. You edit every word before it goes out.",
              ],
              screen: {
                id: "24bef79e-9103-4190-a1ba-9ac4fbfd75c5",
                src: "/content-review/screens/post-composer.png",
                alt: "Teacher Workspace Posts composer with a draft financial-assistance message and parent preview.",
                breadcrumb: ["Posts", "New post"],
              },
            },
            {
              id: "8bb4f6d3-50f5-4e09-8f5a-3a2c932814d2",
              label: "The family is in the loop. So is the record.",
              heading: "The family hears from you, and the record shows it.",
              body: [
                "The message reaches the family, and you can see when they have read it. The exchange stays on Xiao Ming's record: you will know when the application goes in, and when it is approved.",
              ],
              screen: {
                id: "d9e36bc7-89b2-48b0-b35e-11867763d44a",
                src: "/content-review/screens/post-read-tracking.png",
                alt: "Teacher Workspace sent post with posted status and recipient read tracking.",
                breadcrumb: ["Posts", "Sent post", "Read tracking"],
              },
            },
          ],
        },
      },
      {
        id: "fd9a7815-00b4-4a6f-8b69-c83a05b7b90d",
        type: "reveal",
        state: "visible",
        fields: {
          heading: "This is Teacher Workspace.",
          body: [
            "The care in those four moments was already yours. We took out the chasing, the cross-referencing, and the drafting from scratch that used to sit between them.",
          ],
          asides: [
            {
              id: "c4e336ce-d699-4e9f-9818-bcfe2bbe4f4e",
              body: [
                "Now generally available to schools across Singapore, and still shaped by the teachers who use it.",
              ],
            },
          ],
        },
      },
      {
        id: "c8de156c-516f-4ba6-b7c4-b4ed652cb45d",
        type: "capabilities",
        state: "visible",
        fields: {
          heading: "The apps, up close",
          items: [
            {
              id: "e3e3e742-0940-4c73-955c-7f9d1fa2eb17",
              label: "Student Insights",
              heading: "Every signal about a student, in one profile.",
              body: [
                "A form teacher opens one profile and sees attendance, wellbeing notes, and family context together, including a sibling already receiving financial assistance and no bursary on file.",
              ],
            },
            {
              id: "281042b3-485f-49b4-879b-efc3eecb110a",
              label: "AI next-step guidance",
              heading:
                "The right process for this case, on the student's profile.",
              body: [
                "A student may qualify for a bursary. The matching scheme, the documents the family needs, where to submit, and when it closes appear on his profile, so you do not have to go through the handbook.",
              ],
            },
            {
              id: "6c083324-4ddc-4d37-a6f2-3293426df645",
              label: "Message drafting",
              heading:
                "A first draft from the student's context, for you to review and edit.",
              body: [
                "A delicate note telling a family they may qualify for support starts drafted in your tone, with the steps laid out. You edit every word before it goes out.",
              ],
            },
            {
              id: "830154c5-0487-4ef1-82cd-d00444f27973",
              label: "Posts",
              heading: "Reach the family and keep the communication on record.",
              body: [
                "The message reaches the family in minutes, you can see when they have read it, and the exchange stays on the student's record.",
              ],
            },
          ],
        },
      },
      {
        id: "76329aa6-ea3d-4f34-b6a3-3d9a222b2df0",
        type: "close",
        state: "visible",
        fields: {
          heading: "Noticed and handled, before tomorrow's bell.",
          body: [
            "One teacher saw the sign, knew the steps, reached the family, and has it on file. Teacher Workspace keeps that whole journey in one place.",
          ],
          action: {
            label: "Sign in with Google",
            note: "Use your @edu.gov.sg account.",
          },
        },
      },
      {
        id: "c091f7ce-49db-4acc-89ed-91613e7e475a",
        type: "access-support",
        state: "visible",
        fields: {
          heading: "Access and support",
          accessHeading: "Teacher access",
          methodLabel: "Access method",
          method: "Sign in with Google",
          accountNote: "Use your @edu.gov.sg account.",
        },
      },
      {
        id: "54fd7d5c-8c75-456e-abc7-5835ed93a3c1",
        type: "footer-feedback",
        state: "visible",
        fields: {
          brand: "Teacher Workspace",
          body: ["© MOE 2026"],
          feedbackLabel: "Send feedback",
        },
      },
    ],
  },
  reviewDocument: {
    targets: {
      "02e79e5c-bd01-47e5-be54-95b7c939c358": {
        designIntent:
          "Teachers need to understand the page's value within seconds. The opening names one clear outcome, then shows where the work begins.",
        checks: [
          "Does the opening promise match what Teacher Workspace can deliver today?",
          "Can a teacher understand the main benefit without reading the rest of the page?",
        ],
      },
      "7d2140d1-15e7-4762-b3b3-17e261c85948": {
        designIntent:
          "The student profile makes the opening promise concrete. It shows the signals, actions, and navigation in one familiar view.",
        checks: [
          "Does the profile support the promise made beside it?",
          "Could any name or detail be mistaken for real student data?",
        ],
        decisionNeeded:
          "Replace this capture if the approved student profile changes before launch.",
      },
      "e4a6a36b-bb0a-4977-854b-66f3db071123": {
        designIntent:
          "One synthetic student gives the page a clear thread, so each step feels connected. The bursary journey shows the hand-off between products without using a real case. It appears before the capability list so each feature has a clear example.",
        checks: [
          "Does each step follow naturally from the one before it?",
          "Could any name, number, or family detail be mistaken for real student data?",
          "Does the example avoid sensitive groups, including SWaN students?",
        ],
      },
      "74176ccd-fdee-47a2-9308-286146f2366b": {
        designIntent:
          "The story starts in a familiar class list before moving into one profile. Teachers can recognise the setting before the support journey begins.",
        checks: [
          "Does the class list look familiar to a form teacher?",
          "Are all student names and details clearly synthetic?",
        ],
        decisionNeeded:
          "Create a clean story-state capture without unrelated attention tags.",
      },
      "9618e896-adda-4973-95e0-61c45360a2f5": {
        designIntent:
          "The family section shows why a teacher may notice a support need. Its signals are invented and do not describe a real student.",
        checks: [
          "Do the visible fields support the eligibility claim in the story?",
          "Does the example avoid unnecessary family or financial detail?",
        ],
        decisionNeeded:
          "Confirm which bursary eligibility signals the approved product will show.",
      },
      "f050b81e-c800-4013-9258-57d991041363": {
        designIntent:
          "Guidance follows the eligibility signal so the page answers the teacher's next question: what should I do now?",
        checks: [
          "Does the guidance follow directly from the signal shown before it?",
          "Can a teacher tell which steps still need product approval?",
        ],
        decisionNeeded:
          "Confirm whether bursary matching, documents, submission details, and closing dates are planned for launch.",
      },
      "24bef79e-9103-4190-a1ba-9ac4fbfd75c5": {
        designIntent:
          "The draft appears after the teacher understands the case. Showing an editable message makes the teacher's review and control clear.",
        checks: [
          "Is the message visibly editable before it is sent?",
          "Does the draft avoid claiming that AI can send a message without teacher approval?",
        ],
      },
      "d9e36bc7-89b2-48b0-b35e-11867763d44a": {
        designIntent:
          "Read tracking closes the journey. It shows that the family received the message and that the action stays on record.",
        checks: [
          "Does the screen show delivery and read status clearly?",
          "Does the page distinguish current product behaviour from the proposed student record?",
        ],
        decisionNeeded:
          "Confirm whether application updates will appear on the student's record at launch.",
      },
      "fd9a7815-00b4-4a6f-8b69-c83a05b7b90d": {
        designIntent:
          "The page names Teacher Workspace after the journey has shown its value. This pause turns the example into a clear product idea without interrupting the story early.",
        checks: [
          "Does the reveal feel earned by the story above it?",
          "Does it describe the product without making a claim the story has not shown?",
        ],
      },
      "c8de156c-516f-4ba6-b7c4-b4ed652cb45d": {
        designIntent:
          "After the story, this section maps each moment to a product capability. Teachers can read the list with a clear example in mind.",
        checks: [
          "Does every capability connect to a moment shown in the story?",
          "Are product names and claims accurate for the current release?",
        ],
      },
      "76329aa6-ea3d-4f34-b6a3-3d9a222b2df0": {
        designIntent:
          "The closing returns to the teacher's outcome and repeats the sign-in action. It comes after the evidence, when a teacher can decide whether to continue.",
        checks: [
          "Does the closing reflect the journey shown above?",
          "Is the sign-in action correct for the release?",
        ],
      },
      "c091f7ce-49db-4acc-89ed-91613e7e475a": {
        designIntent:
          "Access details sit after the main story so setup does not interrupt it. Teachers still get the sign-in requirement before reaching the footer.",
        checks: [
          "Is the access method correct?",
          "Can a teacher tell which account to use?",
        ],
        decisionNeeded:
          "Confirm the support route and final access wording before launch.",
      },
      "54fd7d5c-8c75-456e-abc7-5835ed93a3c1": {
        designIntent:
          "The footer ends with product ownership and a feedback route. It stays brief because the main decision has already been made above.",
        checks: [
          "Are the owner, year, and feedback route correct?",
          "Does the footer avoid repeating the access section?",
        ],
      },
    },
  },
} as const satisfies CmsVersionContract
