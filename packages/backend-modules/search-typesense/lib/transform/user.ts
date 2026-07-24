import { TypesenseUserDocument } from '../collections'

/**
 * Minimal shape of a public.users row needed to build a Typesense user
 * document. Reference: @orbiting/backend-modules-search/lib/inserts/user.js
 */
export interface UserRow {
  id: string
  firstName: string | null
  lastName: string | null
  username: string | null
  biography: string | null
  statement: string | null
  hasPublicProfile: boolean
  createdAt: Date | string | number
}

export interface ListedCredential {
  description: string | null
}

export interface UserTransformDeps {
  /** Resolves the user's single "listed" credential, if any. */
  getListedCredential: (userId: string) => Promise<ListedCredential | null>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PgDb = any

/**
 * Builds `UserTransformDeps` backed by live Postgres reads. Shared between
 * lib/listener.ts (real-time) and script/reindex.ts (bulk backfill) so both
 * query the exact same fields.
 */
export const makeUserDeps = (pgdb: PgDb): UserTransformDeps => ({
  getListedCredential: async (userId) =>
    pgdb.public.credentials.findOne(
      { userId, isListed: true },
      { fields: ['description'], limit: 1 },
    ),
})

const toUnixMs = (value: Date | string | number): number =>
  new Date(value).getTime()

/**
 * Transforms a public.users row into a flat Typesense user document.
 *
 * Unlike comments, ALL users are transformed/written here -- including
 * users with hasPublicProfile: false. Privacy enforcement for search
 * results happens at query time elsewhere (scoped API keys), not here.
 */
export const transformUser = async (
  row: UserRow,
  deps: UserTransformDeps,
): Promise<TypesenseUserDocument> => {
  const listedCredential = await deps.getListedCredential(row.id)
  const credential = listedCredential?.description?.trim() || undefined

  const name = [row.firstName, row.lastName].filter(Boolean).join(' ').trim()

  const doc: TypesenseUserDocument = {
    id: row.id,
    name,
    hasPublicProfile: !!row.hasPublicProfile,
    searchScope: row.hasPublicProfile ? 'public' : 'admin',
    createdAt: toUnixMs(row.createdAt),
  }

  if (row.username) {
    doc.username = row.username
  }
  if (row.biography) {
    doc.biography = row.biography
  }
  if (row.statement) {
    doc.statement = row.statement
  }
  if (credential) {
    doc.credential = credential
  }

  return doc
}
