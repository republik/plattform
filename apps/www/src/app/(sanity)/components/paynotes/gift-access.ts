import { getUTMSessionStorage } from '@/app/lib/analytics/utm-session-storage'

const GIFT_ACCESS_KEY = 'republik-gift-access'
const UTM_STORAGE_KEY = 'republik-utm'

export type GiftGranter = {
  name: string
  portrait: string | null
  hasPublicProfile: boolean
}

export type GiftAccess = {
  token: string
  /** Sanity document ref, as `collectionsDocumentId()` builds it. */
  documentId: string
  expiresAt: string
  granter: GiftGranter | null
}

/**
 * Redeemed gift links, keyed by the article's Sanity document id. Held in
 * localStorage, so access belongs to the browser — the recipient has no
 * account. Reads are wrapped: in private mode, or with site data blocked, the
 * accessor throws instead of returning null.
 */
type GiftAccessStore = Record<string, GiftAccess>

function readStore(): GiftAccessStore {
  try {
    return JSON.parse(localStorage.getItem(GIFT_ACCESS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeStore(store: GiftAccessStore): void {
  try {
    localStorage.setItem(GIFT_ACCESS_KEY, JSON.stringify(store))
  } catch {
    // The reader keeps access for this page load; it won't survive a reload.
  }
}

/**
 * How long a run-out link stays in the store, so a returning reader is still
 * told the gift expired. Also what keeps the store from growing forever.
 */
const FORGET_AFTER_MS = 90 * 24 * 60 * 60 * 1000

export function storeGiftAccess(access: GiftAccess): void {
  const store = readStore()
  const forgetBefore = Date.now() - FORGET_AFTER_MS

  const pruned = Object.fromEntries(
    Object.entries(store).filter(
      ([, entry]) => new Date(entry.expiresAt).getTime() > forgetBefore,
    ),
  )
  pruned[access.documentId] = access
  writeStore(pruned)
}

/**
 * The redeemed link for this article, live or run out; `isGiftAccessValid`
 * tells the two apart.
 */
export function getGiftAccess(documentId: string | null): GiftAccess | null {
  if (!documentId) {
    return null
  }
  return readStore()[documentId] ?? null
}

export function isGiftAccessValid(access: GiftAccess | null): boolean {
  return !!access && new Date(access.expiresAt) > new Date()
}

/**
 * Writes the gift into the UTM session storage, from where it travels with the
 * UTM parameters to the shop and into the `meta` of a trial, pledge or signup.
 */
export function storeGiftAttribution(token: string, documentId: string): void {
  try {
    const params = getUTMSessionStorage()
    params.gift_token = token
    params.gift_document_id = documentId
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params))
  } catch {
    // Best effort; access does not depend on it.
  }
}
