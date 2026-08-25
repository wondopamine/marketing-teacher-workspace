import { randomBytes } from "node:crypto"

import { hashCmsEditKey } from "../src/auth/cms-capability.server"

const editKey = randomBytes(32).toString("base64url")
const cookieSecret = randomBytes(32).toString("base64url")

console.log(`CMS_EDIT_KEY_HASH=${hashCmsEditKey(editKey)}`)
console.log(`CMS_COOKIE_SECRET=${cookieSecret}`)
console.log(`Shared path: /api/cms/session?key=${editKey}`)
