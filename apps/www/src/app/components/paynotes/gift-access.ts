const GIFT_ACCESS_KEY = 'republik-gift-access'
const GIFT_ATTRIBUTION_KEY = 'republik-gift-attribution'

type StoredGiftAccess = {
  token: string
  documentPath: string
  expiresAt: string
  granter?: {
    name: string
    portrait: string | null
    hasPublicProfile: boolean
  }
}

type GiftAccessStore = {
  [documentPath: string]: StoredGiftAccess
}

export function storeGiftAccess(access: StoredGiftAccess): void {
  try {
    const store = getGiftAccessStore()
    store[access.documentPath] = access
    localStorage.setItem(GIFT_ACCESS_KEY, JSON.stringify(store))
  } catch {}
}

export function getGiftAccessForPath(
  path: string,
): StoredGiftAccess | null {
  try {
    const store = getGiftAccessStore()
    const access = store[path]
    if (!access) return null

    const now = new Date()
    if (new Date(access.expiresAt) <= now) {
      delete store[path]
      localStorage.setItem(GIFT_ACCESS_KEY, JSON.stringify(store))
      return null
    }

    return access
  } catch {
    return null
  }
}

export function getExpiredGiftAccessForPath(
  path: string,
): StoredGiftAccess | null {
  try {
    const raw = localStorage.getItem(GIFT_ACCESS_KEY)
    if (!raw) return null
    const store: GiftAccessStore = JSON.parse(raw)
    const access = store[path]
    if (!access) return null

    const now = new Date()
    if (new Date(access.expiresAt) <= now) {
      return access
    }
    return null
  } catch {
    return null
  }
}

function getGiftAccessStore(): GiftAccessStore {
  try {
    const raw = localStorage.getItem(GIFT_ACCESS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

export function storeGiftAttribution(token: string, documentPath: string): void {
  try {
    const params = JSON.parse(
      window.sessionStorage.getItem('republik-utm') ?? '{}',
    )
    params.gift_token = token
    params.gift_article_path = documentPath
    window.sessionStorage.setItem('republik-utm', JSON.stringify(params))
  } catch {}
}
