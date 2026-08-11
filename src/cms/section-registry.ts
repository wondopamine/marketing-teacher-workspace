import { cmsSectionTypes } from "./document"

import type { CmsSectionType } from "./document"

export type CmsSectionRule = {
  readonly type: CmsSectionType
  readonly label: string
  readonly minimum: number
  readonly maximum: number
  readonly canArchive: boolean
  readonly mustBeLast: boolean
}

export const cmsSectionRegistry = {
  promise: {
    type: "promise",
    label: "Opening promise",
    minimum: 1,
    maximum: 1,
    canArchive: false,
    mustBeLast: false,
  },
  "connected-story": {
    type: "connected-story",
    label: "Connected story",
    minimum: 0,
    maximum: 1,
    canArchive: true,
    mustBeLast: false,
  },
  reveal: {
    type: "reveal",
    label: "Reveal",
    minimum: 0,
    maximum: 1,
    canArchive: true,
    mustBeLast: false,
  },
  capabilities: {
    type: "capabilities",
    label: "Capabilities",
    minimum: 0,
    maximum: 1,
    canArchive: true,
    mustBeLast: false,
  },
  close: {
    type: "close",
    label: "Closing action",
    minimum: 0,
    maximum: 1,
    canArchive: true,
    mustBeLast: false,
  },
  "access-support": {
    type: "access-support",
    label: "Access and support",
    minimum: 0,
    maximum: 1,
    canArchive: true,
    mustBeLast: false,
  },
  "footer-feedback": {
    type: "footer-feedback",
    label: "Footer",
    minimum: 1,
    maximum: 1,
    canArchive: false,
    mustBeLast: true,
  },
} as const satisfies Record<CmsSectionType, CmsSectionRule>

const registryTypes = Object.keys(cmsSectionRegistry).sort()
const contractTypes = [...cmsSectionTypes].sort()

if (
  registryTypes.length !== contractTypes.length ||
  registryTypes.some((type, index) => type !== contractTypes[index])
) {
  throw new Error("The CMS section registry does not match its type contract")
}
