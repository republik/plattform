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
 * Redeemed gift links, keyed by the article's Sanity document id — not by its
 * path, which can change under a reader who redeemed the link days ago.
 *
 * localStorage, not a cookie or the backend: access is granted to a *browser*,
 * for a recipient who by definition has no account. Every read is wrapped,
 * because a browser in private mode (or with site data blocked) throws rather
 * than returning null.
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
    // Nothing to do: the reader keeps access for this page load either way,
    // they just won't come back to it.
  }
}

/**
 * How long a run-out link is still remembered. A returning reader is told the
 * gift expired rather than meeting the plain paywall — but only for a while,
 * so the store doesn't accumulate an entry per gifted article forever.
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
 * The redeemed link for this article, live or run out — the caller decides
 * which of the two paynotes that means. An expired entry is kept rather than
 * dropped, so a returning reader is told the link ran out instead of silently
 * meeting the paywall.
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
 * Gift-to-conversion attribution rides along with the UTM parameters, so it
 * reaches the shop (and from there the `meta` of a trial, pledge or signup)
 * through the machinery that is already there.
 */
export function storeGiftAttribution(token: string, documentId: string): void {
  try {
    const params = getUTMSessionStorage()
    params.gift_token = token
    params.gift_document_id = documentId
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params))
  } catch {
    // Attribution is nice to have; access is not conditional on it.
  }
}
