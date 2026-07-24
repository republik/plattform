import { getClient } from './client'

/**
 * Scoped Typesense search-key generation.
 *
 * A Typesense *scoped* key is generated locally (HMAC, no network call) from
 * a *parent* search-only key via `generateScopedSearchKey(parentKey, params)`
 * -- but which collection(s) that key can search is a property of the
 * PARENT key itself (set when the parent key was created via the Typesense
 * admin API with a `collections` restriction), not something the scoped-key
 * generation call can add or narrow further. `generateScopedSearchKeyParams`
 * only lets you *tighten* query-time params (filter_by, expires_at, ...) on
 * top of whatever collection(s) the parent key already allows.
 *
 * Every collection (articles, comments, users) carries a shared `searchScope`
 * field (see lib/collections.ts), so a SINGLE parent key restricted to all
 * three collections can be used regardless of caller tier -- only the
 * embedded `filter_by` on `searchScope` changes per tier. This supersedes an
 * earlier two-parent-key design (one scoped to `users`, one to `comments`)
 * that was needed only because privacy was originally going to be gated by a
 * `users`-only field (`hasPublicProfile`).
 *
 * Expects one pre-created parent search-only key (see
 * script/create-search-keys.ts, a one-time ops step -- Typesense never
 * returns a key's secret again after creation, so the value must be copied
 * into an env var once and kept there): TYPESENSE_SEARCH_KEY.
 */

const DEFAULT_TTL_SECONDS = 5 * 60

export type SearchCallerTier = 'public' | 'member' | 'admin'

export interface ScopedSearchKey {
  key: string
  expiresAt: Date
}

const getParentKey = (): string => {
  const key = process.env.TYPESENSE_SEARCH_KEY
  if (!key) {
    throw new Error(
      'TYPESENSE_SEARCH_KEY is not set -- required to mint scoped search keys (see script/create-search-keys.ts)',
    )
  }
  return key
}

/**
 * The searchScope filter_by for a given caller tier. `admin` gets no filter
 * at all (sees every document, including any future non-public tier).
 */
const filterForTier = (tier: SearchCallerTier): string | undefined => {
  switch (tier) {
    // No document currently carries a "member" searchScope -- a non-public
    // profile is "admin" scope only (findable via search by admin/support
    // callers alone, not by other logged-in members). The "member" tier is
    // kept distinct from "public" here so a future member-only searchScope
    // value (e.g. on some other collection) can be introduced without
    // touching this switch again.
    // TODO: revisit once a real member-only searchScope value exists on any
    // collection -- until then this branch is speculative and behaves
    // identically to 'public'.
    case 'public':
    case 'member':
      return 'searchScope:=public'
    case 'admin':
      return undefined
  }
}

/**
 * Mints a scoped search key for the given caller tier.
 *
 * @param tier  'public' for unauthenticated callers, 'member' for
 *   authenticated callers with the `member` role, 'admin' for callers with
 *   the `admin`/`supporter` role (checked by the caller before choosing the
 *   tier -- see graphql/resolvers/_queries/searchApiKey.ts).
 */
export const generateScopedSearchKey = (
  tier: SearchCallerTier,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): ScopedSearchKey => {
  const client = getClient()
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
  const expiresAtUnix = Math.floor(expiresAt.getTime() / 1000)

  const key = client.keys().generateScopedSearchKey(getParentKey(), {
    filter_by: filterForTier(tier),
    expires_at: expiresAtUnix,
  })

  return { key, expiresAt }
}
