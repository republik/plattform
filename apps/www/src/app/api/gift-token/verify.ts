import { createPublicKey, type KeyObject, verify } from 'node:crypto'
import type { VerifiedGiftToken } from './types'

let publicKey: KeyObject | null = null

function getPublicKey(): KeyObject | null {
  if (!publicKey) {
    const key = process.env.GIFT_LINK_PUBLIC_KEY
    if (!key) {
      console.error('GIFT_LINK_PUBLIC_KEY is not set, gift links are refused')
      return null
    }
    publicKey = createPublicKey({
      key: Buffer.from(key.trim(), 'base64'),
      format: 'der',
      type: 'spki',
    })
  }
  return publicKey
}

export function verifyGiftToken(token: string): VerifiedGiftToken | null {
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
