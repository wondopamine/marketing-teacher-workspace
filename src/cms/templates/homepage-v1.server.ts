import "@tanstack/react-start/server-only"

import {
  cmsPageSchemaVersion,
  cmsReviewSchemaVersion,
  cmsSectionLibraryVersion,
} from "../document"
import { teacherPreviewScreenCatalog } from "../../content/teacher-preview-screen-catalog.server"

import type { CmsScreenDocument, CmsVersionContract } from "../document"
import type { TeacherPreviewScreenId } from "../../content/teacher-preview-screen-catalog.server"

export const cmsHomepagePageId = "b7a1e972-1758-4815-87b9-9697a324a667"
export const cmsHomepageImportAttemptId = "2f0cc277-91aa-4c30-9070-cd8a755cb90f"

function cmsScreen(
  sourceId: TeacherPreviewScreenId,
  id: string
): CmsScreenDocument {
  const source = teacherPreviewScreenCatalog.find(
    (candidate) => candidate.id === sourceId
  )
  if (!source) throw new Error(`Missing Teacher Workspace screen: ${sourceId}`)
  const { id: _sourceId, ...screen } = source
  return { id, ...screen }
}

/**
 * Repository fallback for the GA review candidate. Existing section, item,
 * and screen IDs are retained so a later append-only CMS save can preserve
 * every colleague comment. This contract is not imported or published by a
 * deployment.
 */
export const homepageV1Contract = {
  pageSchemaVersion: cmsPageSchemaVersion,
  reviewSchemaVersion: cmsReviewSchemaVersion,
  sectionLibraryVersion: cmsSectionLibraryVersion,
  pageDocument: {
    page: {
      title: "Teacher Workspace | See what is changing",
      path: "/",
      description:
        "Understand students, review possible next steps, prepare messages, and communicate with families through Teacher Workspace.",
      brand: "Teacher Workspace",
    },
    sections: [
      {
        id: "02e79e5c-bd01-47e5-be54-95b7c939c358",
        type: "promise",
        state: "visible",
        fields: {
          eyebrow: null,
          heading: "Gain back your time to care for students",
          body: [
            "Use Teacher Workspace to understand students, get help with next steps, draft messages, and communicate with families.",
          ],
          action: {
            label: "Sign in with Google",
            note: "Use your @edu.gov.sg account.",
          },
          screen: cmsScreen("hero", "7d2140d1-15e7-4762-b3b3-17e261c85948"),
        },
      },
      {
        id: "c8de156c-516f-4ba6-b7c4-b4ed652cb45d",
        type: "capabilities",
        state: "visible",
        fields: {
          heading: "Start with the work you do every day",
          items: [
            {
              id: "e3e3e742-0940-4c73-955c-7f9d1fa2eb17",
              label: "Student Insights",
              heading: "Notice and understand changes around a student.",
              body: [
                "Review the student information available to you and recognise patterns worth following up.",
              ],
            },
            {
              id: "281042b3-485f-49b4-879b-efc3eecb110a",
              label: "AI next-step guidance",
              heading: "Review a possible next step.",
              body: [
                "Consider guidance for the task in front of you before deciding what fits.",
              ],
            },
            {
              id: "6c083324-4ddc-4d37-a6f2-3293426df645",
              label: "Message drafting",
              heading: "Prepare an editable first draft.",
              body: [
                "Start from a draft, then review and edit every word before sharing it.",
              ],
            },
            {
              id: "830154c5-0487-4ef1-82cd-d00444f27973",
              label: "Posts",
              heading: "Communicate with families.",
              body: [
                "Publish an approved message and check the delivery information available to you.",
              ],
            },
          ],
        },
      },
      {
        id: "e4a6a36b-bb0a-4977-854b-66f3db071123",
        type: "connected-story",
        state: "visible",
        fields: {
          heading: "Notice and understand",
          steps: [
            {
              id: "6561cfb1-bcd0-46e5-a322-7b8ea96ee6cb",
              label: "Find the students",
              heading: "Find the students you're looking for, easily.",
              body: [
                "Choose what matters, then see which students match. Bring the relevant students into focus without checking every profile one by one.",
              ],
              screen: cmsScreen(
                "story-promise",
                "74176ccd-fdee-47a2-9308-286146f2366b"
              ),
            },
            {
              id: "649d7311-7b87-4efb-8daa-893b4388481e",
              label: "Review the profile",
              heading: "See each student holistically.",
              body: [
                "Attendance, CCA, wellbeing, behaviour and family information come together in one profile. Today, each of those pieces lives across different systems.",
              ],
              screen: cmsScreen(
                "story-notice",
                "9618e896-adda-4973-95e0-61c45360a2f5"
              ),
            },
          ],
        },
      },
      {
        id: "fd9a7815-00b4-4a6f-8b69-c83a05b7b90d",
        type: "connected-story",
        state: "visible",
        fields: {
          heading: "Act with your judgement",
          steps: [
            {
              id: "9d0ccaad-0ad7-45e4-a98b-2c6a4bc8a95b",
              label: "Behind a Release 2 flag",
              heading: "Read a suggested next step before deciding.",
              body: [
                "Guidance frames its suggestion as progress worth sustaining. You weigh it, then decide what fits — the judgement stays yours.",
              ],
              screen: cmsScreen(
                "story-next-steps",
                "f050b81e-c800-4013-9258-57d991041363"
              ),
            },
          ],
        },
      },
      {
        id: "c091f7ce-49db-4acc-89ed-91613e7e475a",
        type: "connected-story",
        state: "visible",
        fields: {
          heading: "Communicate with care",
          steps: [
            {
              id: "22bf511c-0da0-48c7-90e1-7028f8d0e49f",
              label: "Prepare a term update",
              heading: "Write with your whole school behind you.",
              body: [
                "We draw on what teachers across your school have already sent. Your first cut comes back in a format and voice everyone recognises — easy for you to review, quick for your RO to approve.",
              ],
              screen: cmsScreen(
                "story-words",
                "24bef79e-9103-4190-a1ba-9ac4fbfd75c5"
              ),
            },
            {
              id: "8bb4f6d3-50f5-4e09-8f5a-3a2c932814d2",
              label: "Check the published post",
              heading: "Sent. Seen. Followed through.",
              body: [
                "You see which families have read your post and which haven't. We send the reminders, so the follow-up isn't yours to carry. Every family stays on track with you.",
              ],
              screen: cmsScreen(
                "story-family-and-record",
                "d9e36bc7-89b2-48b0-b35e-11867763d44a"
              ),
            },
          ],
        },
      },
      {
        id: "76329aa6-ea3d-4f34-b6a3-3d9a222b2df0",
        type: "reveal",
        state: "visible",
        fields: {
          heading: "The care was always yours. We removed the admin between the moments.",
          body: [
            "Four capabilities support one journey: identifying, understanding, deciding, and engaging students and families. Teachers keep professional judgement and final review.",
          ],
          asides: [
            {
              id: "c4e336ce-d699-4e9f-9818-bcfe2bbe4f4e",
              body: [
                "Teachers review and decide before guidance or drafted content is used.",
              ],
            },
          ],
        },
      },
      {
        id: "a118f80c-9180-4fd6-b163-3fce876b9871",
        type: "close",
        state: "visible",
        fields: {
          heading: "Start with the work in front of you.",
          body: [
            "See what has changed, review the next step, and decide what to do.",
          ],
          action: {
            label: "Sign in with Google",
            note: "Use your @edu.gov.sg account.",
          },
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
          "Lead with the teacher's outcome and one primary action. The headline should make the page useful before it names the capabilities.",
        checks: [
          "Can an everyday teacher understand the value within seconds?",
          "Does the opening avoid implying one automated workflow?",
        ],
      },
      "7d2140d1-15e7-4762-b3b3-17e261c85948": {
        designIntent:
          "Use one focused, approved product state at the fold. Do not invent a Teacher Workspace home screen or app shelf.",
        checks: [
          "Does the state show one clear teacher task?",
          "Is every visible detail synthetic and safe for public review?",
        ],
        decisionNeeded:
          "Choose the approved GA screen, state, and crop with the capability owner.",
      },
      "c8de156c-516f-4ba6-b7c4-b4ed652cb45d": {
        designIntent:
          "Orient teachers to four related capabilities without presenting four separate brands or a fictional integrated workflow.",
        checks: [
          "Are the four functional names accurate?",
          "Does each line describe a distinct teacher job?",
          "Has each behaviour been confirmed for GA?",
        ],
      },
      "e4a6a36b-bb0a-4977-854b-66f3db071123": {
        designIntent:
          "Use a positive, synthetic Student Insights scenario. The teacher notices progress, reviews recent observations, and decides what it means.",
        checks: [
          "Is the positive moment the focal point?",
          "Does the scenario avoid risk, deficit, and SWaN framing?",
          "Does the teacher remain the decision-maker?",
        ],
      },
      "74176ccd-fdee-47a2-9308-286146f2366b": {
        designIntent:
          "Show a class view with one positive synthetic tag, not an attention or conduct marker.",
        checks: [
          "Is the tag visibly positive?",
          "Are the student and class details clearly synthetic?",
        ],
        decisionNeeded:
          "Confirm whether the proposed positive tag exists at GA.",
      },
      "9618e896-adda-4973-95e0-61c45360a2f5": {
        designIntent:
          "Show the observations behind the positive tag so a teacher can understand the change without turning the student into a case.",
        checks: [
          "Do the observations support the positive tag?",
          "Is unnecessary sensitive detail excluded?",
        ],
        decisionNeeded:
          "Confirm which positive observations and dates may appear in the synthetic state.",
      },
      "fd9a7815-00b4-4a6f-8b69-c83a05b7b90d": {
        designIntent:
          "Use a separate classroom task for AI guidance. The section must not imply an automatic hand-off from Student Insights.",
        checks: [
          "Is this scenario independent from the Student Insights story?",
          "Does the teacher review the possible next step?",
        ],
        decisionNeeded:
          "Confirm the approved AI guidance task, output, and teacher-review language.",
      },
      "f050b81e-c800-4013-9258-57d991041363": {
        designIntent:
          "Show one possible next step with enough context for the teacher to judge it. Do not claim circular reading or scheme matching.",
        checks: [
          "Can the teacher use, adapt, or leave the suggestion?",
          "Does the state avoid rejected claims?",
        ],
        decisionNeeded:
          "Replace the current capture with the GA-approved guidance task.",
      },
      "c091f7ce-49db-4acc-89ed-91613e7e475a": {
        designIntent:
          "Use a separate positive communication scenario. Show Message drafting and Posts as related capabilities without claiming an automatic hand-off.",
        checks: [
          "Is teacher review explicit before publishing?",
          "Does the Posts state use only approved delivery language?",
          "Is unapproved testimonial proof omitted?",
        ],
      },
      "24bef79e-9103-4190-a1ba-9ac4fbfd75c5": {
        designIntent:
          "Show an editable class-update draft with the teacher clearly in control.",
        checks: [
          "Is the draft visibly editable and unsent?",
          "Does the copy avoid claiming that student context created the draft?",
        ],
        decisionNeeded:
          "Confirm the Message drafting entry point and review controls at GA.",
      },
      "d9e36bc7-89b2-48b0-b35e-11867763d44a": {
        designIntent:
          "Show the class update after publishing through Posts. Limit the public claim to approved delivery information.",
        checks: [
          "Does the screen avoid application tracking or student-record claims?",
          "Is the represented delivery state approved for GA?",
        ],
        decisionNeeded:
          "Confirm the exact Posts delivery or read state that may be described publicly.",
      },
      "76329aa6-ea3d-4f34-b6a3-3d9a222b2df0": {
        designIntent:
          "Explain the organisational value for Key Personnel and School Leaders while keeping everyday teachers primary.",
        checks: [
          "Does the section lead with more consistent school practice?",
          "Does it preserve teacher judgement and review?",
          "Are access, control, and data assurances approved?",
        ],
        decisionNeeded:
          "PM, capability owners, policy, and security must approve this assurance.",
      },
      "a118f80c-9180-4fd6-b163-3fce876b9871": {
        designIntent:
          "Close on the teacher's next action, repeat the single Google sign-in CTA, and keep access guidance brief.",
        checks: [
          "Is the sign-in action correct?",
          "Can a teacher tell which account to use?",
        ],
      },
      "54fd7d5c-8c75-456e-abc7-5835ed93a3c1": {
        designIntent:
          "End with product ownership and the existing feedback route without adding another marketing section.",
        checks: [
          "Are the owner, year, and feedback route correct?",
          "Does the footer stay brief?",
        ],
      },
    },
  },
} as const satisfies CmsVersionContract
