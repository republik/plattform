'use server'

import { createPublicKey, verify, type KeyObject } from 'node:crypto'

export type VerifiedGiftToken = {
  /** Sanity document ref, as `collectionsDocumentId()` builds it. */
  documentId: string
  expiresAt: string
}

let publicKey: KeyObject | null = null

function getPublicKey(): KeyObject | null {
  if (!publicKey) {
    const pem = process.env.GIFT_LINK_PUBLIC_KEY
    if (!pem) {
      console.error('GIFT_LINK_PUBLIC_KEY is not set, gift links are refused')
      return null
    }
    // Env files and some dashboards keep a PEM on one line with literal "\n".
    publicKey = createPublicKey(pem.replace(/\\n/g, '\n'))
  }
  return publicKey
}

/**
 * Checks a `?gift=` token signed by the API (`backend-modules/gift-articles`,
 * `signGiftToken`): `base64url(payload).base64url(Ed25519 signature)`.
 *
 * The signature is checked against the payload exactly as it arrived, before
 * anything in it is read, so neither the article nor the expiry can be edited
 * without the link breaking. Returns `null` for anything that isn't a token
 * we signed. A run-out token is returned as such; the caller compares
 * `expiresAt` with the clock, so a returning reader is told the gift expired.
 */
export async function verifyGiftToken(
  token: string,
): Promise<VerifiedGiftToken | null> {
  const key = getPublicKey()
  const [payload, signature, ...rest] = token.split('.')
  if (!key || !payload || !signature || rest.length) {
    return null
  }

  try {
    const valid = verify(
      null,
      Buffer.from(payload),
      key,
      Buffer.from(signature, 'base64url'),
    )
    if (!valid) {
      return null
    }

    const { d, e } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (typeof d !== 'string' || typeof e !== 'number') {
      return null
    }
    return {
      documentId: `sanity:${d}`,
      expiresAt: new Date(e * 1000).toISOString(),
    }
  } catch {
    return null
  }
}
