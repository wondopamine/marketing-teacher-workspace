import "@tanstack/react-start/server-only"

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

export const cmsCapabilitySessionDurationMs = 7 * 24 * 60 * 60 * 1_000
export const cmsCapabilityCookieProduction = "__Host-tw_cms_editor"
export const cmsCapabilityCookieDevelopment = "tw_cms_editor_dev"
export const cmsCsrfHeader = "x-cms-csrf"

type CmsCapabilityConfig = {
  readonly editKeyHash: string
  readonly cookieSecret: string
  readonly sessionDurationMs: number
}

type CmsCapabilityPayload = {
  readonly version: 1
  readonly issuedAt: number
  readonly expiresAt: number
  readonly keyVersion: string
  readonly sessionId: string
  readonly csrfToken: string
}

export type CmsCapabilitySession = {
  readonly expiresAt: string
  readonly sessionId: string
  readonly csrfToken: string
}

export type CmsCapabilityErrorCode =
  | "INVALID_LINK"
  | "UNAUTHORIZED"
  | "EXPIRED"
  | "UNAVAILABLE"
  | "CROSS_ORIGIN"
  | "INVALID_CSRF"

export class CmsCapabilityError extends Error {
  readonly code: CmsCapabilityErrorCode

  constructor(code: CmsCapabilityErrorCode) {
    super(code)
    this.name = "CmsCapabilityError"
    this.code = code
  }
}

type CmsCapabilityDependencies = {
  readonly now: () => number
  readonly randomBytes: (size: number) => Buffer
}

const defaultDependencies: CmsCapabilityDependencies = {
  now: Date.now,
  randomBytes,
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

export function hashCmsEditKey(rawKey: string): string {
  return sha256(`teacher-workspace-cms-edit-key\0${rawKey}`)
}

function keyVersion(editKeyHash: string): string {
  return sha256(`teacher-workspace-cms-key-version\0${editKeyHash}`)
}

function readProductionConfig(): CmsCapabilityConfig {
  const editKeyHash = process.env.CMS_EDIT_KEY_HASH?.trim().toLowerCase()
  const cookieSecret = process.env.CMS_COOKIE_SECRET
  if (!editKeyHash || !/^[0-9a-f]{64}$/.test(editKeyHash)) {
    throw new CmsCapabilityError("UNAVAILABLE")
  }
  if (
    !cookieSecret ||
    Buffer.byteLength(cookieSecret, "utf8") < 32 ||
    Buffer.byteLength(cookieSecret, "utf8") > 512
  ) {
    throw new CmsCapabilityError("UNAVAILABLE")
  }
  return {
    editKeyHash,
    cookieSecret,
    sessionDurationMs: cmsCapabilitySessionDurationMs,
  }
}

function isLocalPlainHttp(url: URL): boolean {
  const localHost =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1" ||
    url.hostname === "[::1]"
  const deployment =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    typeof process.env.VERCEL_ENV === "string"
  return url.protocol === "http:" && localHost && !deployment
}

function assertTransport(requestUrl: string): URL {
  const url = new URL(requestUrl)
  if (url.protocol === "https:" || isLocalPlainHttp(url)) return url
  throw new CmsCapabilityError("UNAVAILABLE")
}

function cookieName(requestUrl: string): string {
  return isLocalPlainHttp(new URL(requestUrl))
    ? cmsCapabilityCookieDevelopment
    : cmsCapabilityCookieProduction
}

function readCookie(request: Request): string | null {
  const expectedName = cookieName(request.url)
  const cookieHeader = request.headers.get("cookie") ?? ""
  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=")
    if (separator < 0) continue
    if (pair.slice(0, separator).trim() !== expectedName) continue
    try {
      return decodeURIComponent(pair.slice(separator + 1).trim())
    } catch {
      return null
    }
  }
  return null
}

function sameBytes(left: Buffer, right: Buffer): boolean {
  return left.byteLength === right.byteLength && timingSafeEqual(left, right)
}

function signPayload(encodedPayload: string, cookieSecret: string): Buffer {
  return createHmac("sha256", cookieSecret).update(encodedPayload).digest()
}

function parsePayload(value: unknown): CmsCapabilityPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (
    Object.keys(record).sort().join(",") !==
    "csrfToken,expiresAt,issuedAt,keyVersion,sessionId,version"
  ) {
    return null
  }
  if (
    record.version !== 1 ||
    typeof record.issuedAt !== "number" ||
    !Number.isSafeInteger(record.issuedAt) ||
    typeof record.expiresAt !== "number" ||
    !Number.isSafeInteger(record.expiresAt) ||
    typeof record.keyVersion !== "string" ||
    !/^[0-9a-f]{64}$/.test(record.keyVersion) ||
    typeof record.sessionId !== "string" ||
    !/^[A-Za-z0-9_-]{22}$/.test(record.sessionId) ||
    typeof record.csrfToken !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(record.csrfToken)
  ) {
    return null
  }
  return record as CmsCapabilityPayload
}

function encodeSession(
  payload: CmsCapabilityPayload,
  cookieSecret: string
): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  )
  const signature = signPayload(encodedPayload, cookieSecret).toString(
    "base64url"
  )
  return `${encodedPayload}.${signature}`
}

function decodeSession(
  token: string,
  config: CmsCapabilityConfig
): CmsCapabilityPayload | null {
  const parts = token.split(".")
  if (parts.length !== 2) return null
  const [encodedPayload, encodedSignature] = parts
  if (!encodedPayload || !encodedSignature) return null

  let suppliedSignature: Buffer
  let payloadValue: unknown
  try {
    suppliedSignature = Buffer.from(encodedSignature, "base64url")
    payloadValue = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    )
  } catch {
    return null
  }

  if (
    !sameBytes(
      suppliedSignature,
      signPayload(encodedPayload, config.cookieSecret)
    )
  ) {
    return null
  }
  return parsePayload(payloadValue)
}

export function createCmsCapabilityService(
  config: CmsCapabilityConfig,
  overrides: Partial<CmsCapabilityDependencies> = {}
) {
  const dependencies = { ...defaultDependencies, ...overrides }

  function exchange(rawKey: string, requestUrl: string) {
    assertTransport(requestUrl)
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(rawKey)) {
      throw new CmsCapabilityError("INVALID_LINK")
    }
    const suppliedHash = Buffer.from(hashCmsEditKey(rawKey), "hex")
    const expectedHash = Buffer.from(config.editKeyHash, "hex")
    if (!sameBytes(suppliedHash, expectedHash)) {
      throw new CmsCapabilityError("INVALID_LINK")
    }

    const issuedAt = dependencies.now()
    const expiresAt = issuedAt + config.sessionDurationMs
    const payload: CmsCapabilityPayload = {
      version: 1,
      issuedAt,
      expiresAt,
      keyVersion: keyVersion(config.editKeyHash),
      sessionId: dependencies.randomBytes(16).toString("base64url"),
      csrfToken: dependencies.randomBytes(32).toString("base64url"),
    }
    const token = encodeSession(payload, config.cookieSecret)
    return {
      session: sessionFromPayload(payload),
      cookieHeader: createCookieHeader(token, expiresAt, requestUrl, issuedAt),
    }
  }

  function requireSession(request: Request): CmsCapabilitySession {
    assertTransport(request.url)
    const token = readCookie(request)
    if (!token) throw new CmsCapabilityError("UNAUTHORIZED")
    const payload = decodeSession(token, config)
    if (!payload) throw new CmsCapabilityError("UNAUTHORIZED")
    if (payload.keyVersion !== keyVersion(config.editKeyHash)) {
      throw new CmsCapabilityError("UNAUTHORIZED")
    }
    const now = dependencies.now()
    if (
      payload.expiresAt <= now ||
      payload.issuedAt > now + 60_000 ||
      payload.expiresAt - payload.issuedAt > config.sessionDurationMs
    ) {
      throw new CmsCapabilityError("EXPIRED")
    }
    return sessionFromPayload(payload)
  }

  function requireMutation(request: Request): CmsCapabilitySession {
    const session = requireSession(request)
    const expectedOrigin = new URL(request.url).origin
    const suppliedOrigin = request.headers.get("origin")
    const fetchSite = request.headers.get("sec-fetch-site")
    if (
      suppliedOrigin !== expectedOrigin ||
      (fetchSite !== null && fetchSite !== "same-origin")
    ) {
      throw new CmsCapabilityError("CROSS_ORIGIN")
    }
    const suppliedCsrf = request.headers.get(cmsCsrfHeader)
    if (
      !suppliedCsrf ||
      !sameBytes(
        Buffer.from(suppliedCsrf, "utf8"),
        Buffer.from(session.csrfToken, "utf8")
      )
    ) {
      throw new CmsCapabilityError("INVALID_CSRF")
    }
    return session
  }

  return { exchange, requireMutation, requireSession }
}

function sessionFromPayload(
  payload: CmsCapabilityPayload
): CmsCapabilitySession {
  return {
    expiresAt: new Date(payload.expiresAt).toISOString(),
    sessionId: payload.sessionId,
    csrfToken: payload.csrfToken,
  }
}

function createCookieHeader(
  token: string,
  expiresAt: number,
  requestUrl: string,
  issuedAt: number
): string {
  const secure = !isLocalPlainHttp(new URL(requestUrl))
  const maxAge = Math.max(0, Math.floor((expiresAt - issuedAt) / 1_000))
  return [
    `${cookieName(requestUrl)}=${encodeURIComponent(token)}`,
    `Max-Age=${maxAge}`,
    `Expires=${new Date(expiresAt).toUTCString()}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    secure ? "Secure" : null,
    "Priority=High",
  ]
    .filter(Boolean)
    .join("; ")
}

export function clearCmsCapabilityCookieHeader(requestUrl: string): string {
  const secure = !isLocalPlainHttp(new URL(requestUrl))
  return [
    `${cookieName(requestUrl)}=`,
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    secure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ")
}

const productionService = {
  exchange(rawKey: string, requestUrl: string) {
    return createCmsCapabilityService(readProductionConfig()).exchange(
      rawKey,
      requestUrl
    )
  },
  requireSession(request: Request) {
    return createCmsCapabilityService(readProductionConfig()).requireSession(
      request
    )
  },
  requireMutation(request: Request) {
    return createCmsCapabilityService(readProductionConfig()).requireMutation(
      request
    )
  },
}

export const exchangeCmsCapability = productionService.exchange
export const requireCmsCapability = productionService.requireSession
export const requireCmsMutation = productionService.requireMutation
