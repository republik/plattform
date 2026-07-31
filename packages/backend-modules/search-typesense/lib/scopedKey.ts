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
 * A scoped key therefore embeds NO document filter at all: the parent key's
 * `collections` restriction is the entire boundary. The caller tier selects
 * *which parent key* is used -- see PARENT_KEY_ENV_BY_TIER below -- and thus
 * which collections the caller may search. An earlier design gated privacy
 * per tier with an embedded `filter_by` on a shared `searchScope` field; that
 * is deprecated. Privacy for user profiles is now enforced at WRITE time
 * instead: non-public profiles are never indexed (see lib/transform/user.ts).
 *
 * All three tiers currently resolve to the same parent key, because there is
 * currently only one set of collections. That is deliberate, not an
 * oversight: minting several identical parent keys would be ops burden for no
 * security difference. The tier -> parent-key indirection is the seam for the
 * admin-only collection that is expected later.
 *
 * No `exclude_fields` is embedded either. That is deliberate and worth
 * preserving:
 * `exclude_fields` only strips a field from the *returned document*, and a
 * scoped key cannot constrain `query_by` at all. Since the key is handed to
 * the browser, `query_by` is caller-controlled -- so an indexed-but-excluded
 * sensitive field is still probeable via hit/no-hit and `highlights`. If a
 * field must never be searchable by a tier, it belongs in a separate
 * collection behind its own parent key (the collection restriction above is
 * the only boundary a caller-supplied query_by cannot reach around), not in
 * `exclude_fields`. This is why the user document carries no email; see
 * TypesenseUserDocument in lib/collections.ts.
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

/**
 * Which parent key each caller tier derives from -- and therefore which
 * collections that tier may search, since the collection restriction lives on
 * the parent key.
 *
 * When an admin-only collection lands, script/create-search-keys.ts mints a
 * second parent key over the wider collection list into
 * TYPESENSE_SEARCH_KEY_ADMIN, and the `admin` entry here points at it. That is
 * the only change needed; nothing else in this module has to move.
 */
const PARENT_KEY_ENV_BY_TIER: Record<SearchCallerTier, string> = {
  public: 'TYPESENSE_SEARCH_KEY',
  member: 'TYPESENSE_SEARCH_KEY',
  admin: 'TYPESENSE_SEARCH_KEY',
}

const getParentKey = (tier: SearchCallerTier): string => {
  const envVar = PARENT_KEY_ENV_BY_TIER[tier]
  const key = process.env[envVar]
  if (!key) {
    throw new Error(
      `${envVar} is not set -- required to mint scoped search keys for the "${tier}" tier (see script/create-search-keys.ts)`,
    )
  }
  return key
}

/**
 * Mints a scoped search key for the given caller tier.
 *
 * The key carries no document filter -- only an expiry. What it may search is
 * decided entirely by the collections its parent key was created over.
 *
 * @param tier  'public' for unauthenticated callers, 'member' for
 *   authenticated callers with the `member` role, 'admin' for callers with
 *   the `admin`/`supporter` role (checked by the caller before choosing the
 *   tier -- see graphql/resolvers/_queries/searchApiKey.ts).
 */
export const generateScopedSearchKey = (
  tier: SearchCallerTier,
): ScopedSearchKey => {
  const client = getClient()
  const expiresAt = new Date(Date.now() + DEFAULT_TTL_SECONDS * 1000)
  const expiresAtUnix = Math.floor(expiresAt.getTime() / 1000)

  const key = client.keys().generateScopedSearchKey(getParentKey(tier), {
    expires_at: expiresAtUnix,
  })

  return { key, expiresAt }
}
