import "@tanstack/react-start/server-only"

import { createHash } from "node:crypto"

import type { CmsVersionContract } from "./document"

type JsonPrimitive = boolean | number | string | null
type JsonValue = JsonPrimitive | ReadonlyArray<JsonValue> | JsonObject
type JsonObject = { readonly [key: string]: JsonValue }

function canonicalValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value
  }
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nested]) => nested !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalValue(nested)])
    )
  }
  throw new TypeError("CMS documents may contain only JSON values")
}

export function canonicaliseCmsValue(value: unknown): string {
  return JSON.stringify(canonicalValue(value))
}

export function digestCmsValue(value: unknown): string {
  return createHash("sha256").update(canonicaliseCmsValue(value)).digest("hex")
}

export function digestCmsVersionContract(contract: CmsVersionContract): string {
  return digestCmsValue(contract)
}
