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
        "Teacher Workspace | Student support and family communication, in one place",
      path: "/",
      description:
        "Teacher Workspace brings student context, next steps, family messages, sent posts and read status together, so teachers can follow through without switching between systems.",
      brand: "Teacher Workspace",
    },
    sections: [
      {
        id: "02e79e5c-bd01-47e5-be54-95b7c939c358",
        type: "promise",
        state: "visible",
        fields: {
          eyebrow: null,
          heading: "Bring student support and family communication together",
          body: [
            "See what is happening with a student, check what to do next, write to the family and see when the message is read.",
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
          heading:
            "One example: how a support need moves through Teacher Workspace",
          steps: [
            {
              id: "6561cfb1-bcd0-46e5-a322-7b8ea96ee6cb",
              label: "Start with the class",
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
              label: "See the context",
              heading:
                "Xiao Ming's family may qualify for support. Nobody has applied.",
              body: [
                "His profile brings together three eligibility signals: a sibling already receiving financial assistance, household circumstances updated last term, and no bursary on file. You are reading this while the application window is still open.",
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
              label: "Check the next step",
              heading:
                "Teacher Workspace shows the bursary and application steps.",
              body: [
                "The guidance names the matching scheme, the documents the family needs, where to submit them and when the window closes. You do not have to work through the circulars or ask another teacher.",
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
              label: "Prepare the message",
              heading: "Start with a draft for the family.",
              body: [
                "Message drafting starts with Xiao Ming's context, your tone and the application steps. You review and edit every word before it goes out.",
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
              label: "Send and follow up",
              heading:
                "Posts keeps the family message and read status together.",
              body: [
                "Send the message through Posts and see when the family has read it. You can return to the sent post when you need to follow up.",
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
            "Student Insights helps you understand the situation. AI next-step guidance, Message drafting and Posts help you act and contact the family.",
          ],
          asides: [
            {
              id: "c4e336ce-d699-4e9f-9818-bcfe2bbe4f4e",
              body: [
                "Now available to schools across Singapore. Teachers continue to shape how it works.",
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
          heading: "What you can do in Teacher Workspace",
          items: [
            {
              id: "e3e3e742-0940-4c73-955c-7f9d1fa2eb17",
              label: "Student Insights",
              heading:
                "Understand a student without piecing together several systems.",
              body: [
                "Open one profile to view attendance, behaviour, wellbeing and family context together. Move from the class view to the detail you need.",
              ],
            },
            {
              id: "281042b3-485f-49b4-879b-efc3eecb110a",
              label: "AI next-step guidance",
              heading: "Check the next step for the situation in front of you.",
              body: [
                "For a bursary case, the guidance can show the matching scheme, required documents, submission route and closing date.",
              ],
            },
            {
              id: "6c083324-4ddc-4d37-a6f2-3293426df645",
              label: "Message drafting",
              heading: "Start with a family message you can review.",
              body: [
                "Message drafting uses the student's context and your tone to prepare a first draft. You edit every word before it goes out.",
              ],
            },
            {
              id: "830154c5-0487-4ef1-82cd-d00444f27973",
              label: "Posts",
              heading: "Send the message and see whether it was read.",
              body: [
                "Posts carries the message to the family and keeps the sent post, status and recipient read information together.",
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
          heading: "Keep the work around each student connected.",
          body: [
            "Teacher Workspace brings student context, next-step guidance, family messages and read status into one workflow.",
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
          "Teachers need to understand within seconds that Teacher Workspace covers both student support and family communication. The profile is a familiar starting point, while the copy makes clear that the work continues beyond it.",
        checks: [
          "Does the opening describe the platform rather than one screen or one bursary case?",
          "Can a teacher see that family communication is part of Teacher Workspace?",
        ],
      },
      "7d2140d1-15e7-4762-b3b3-17e261c85948": {
        designIntent:
          "The student profile is one entry point, not the whole product. It grounds the opening in Student Insights before the story moves through guidance, message drafting and Posts.",
        checks: [
          "Does the copy prevent the profile from reading as the whole platform?",
          "Could any name or detail be mistaken for real student data?",
        ],
        decisionNeeded:
          "Replace this capture if the approved student profile changes before launch.",
      },
      "e4a6a36b-bb0a-4977-854b-66f3db071123": {
        designIntent:
          "The synthetic bursary case is one worked example across four parts of Teacher Workspace. It keeps the flow easy to follow without presenting Student Insights as the whole platform. It appears before the capability list so each tool has a concrete example.",
        checks: [
          "Does each step follow naturally from the one before it?",
          "Is it clear that this is one example rather than the platform's only use?",
          "Could any name, number, family detail or sensitive classification be mistaken for real student data?",
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
          "The reveal turns the example into a platform explanation. It names the public capabilities and shows how the work moves from understanding the student to communicating with the family.",
        checks: [
          "Does the reveal widen the story from one profile to the whole workflow?",
          "Are the four public capability names accurate?",
        ],
      },
      "c8de156c-516f-4ba6-b7c4-b4ed652cb45d": {
        designIntent:
          "This section widens from one bursary case to the jobs the platform supports. Each card says what the capability does and uses the case only where it adds clarity.",
        checks: [
          "Can a visitor understand that Teacher Workspace includes more than Student Insights?",
          "Does Posts make the family-facing part of the platform clear?",
          "Are product names and claims accurate for the current release?",
        ],
      },
      "76329aa6-ea3d-4f34-b6a3-3d9a222b2df0": {
        designIntent:
          "The closing returns to the platform promise and repeats the sign-in action. It links student context, guidance and family communication without repeating the bursary story.",
        checks: [
          "Does the closing describe the connected platform in plain language?",
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
