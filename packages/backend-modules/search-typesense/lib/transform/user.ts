// eslint-disable-next-line @typescript-eslint/no-require-imports -- untyped JS package
const { naming } = require('@orbiting/backend-modules-utils')

import { PgDb } from '@orbiting/backend-modules-types'

import { TypesenseUserDocument } from '../collections'
import { getPortraitUrl, toUnixMs } from './fields'

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
  portraitUrl: string | null
  hasPublicProfile: boolean
  createdAt: Date | string | number
}

/**
 * The `fields` every reader of a users row must select, so lib/listener.ts
 * (real-time) and script/reindex.ts (bulk backfill) can't drift from `UserRow`
 * or from each other.
 */
export const USER_ROW_FIELDS = [
  'id',
  'firstName',
  'lastName',
  'username',
  'biography',
  'statement',
  'portraitUrl',
  'hasPublicProfile',
  'createdAt',
]

export interface ListedCredential {
  description: string | null
  verified: boolean | null
}

export interface UserTransformDeps {
  /** Resolves the user's single "listed" credential, if any. */
  getListedCredential: (userId: string) => Promise<ListedCredential | null>
}

/**
 * Builds `UserTransformDeps` backed by live Postgres reads. Shared between
 * lib/listener.ts (real-time) and script/reindex.ts (bulk backfill) so both
 * query the exact same fields.
 */
export const makeUserDeps = (pgdb: PgDb): UserTransformDeps => ({
  getListedCredential: async (userId) =>
    pgdb.public.credentials.findOne(
      { userId, isListed: true },
      { fields: ['description', 'verified'], limit: 1 },
    ),
})

/**
 * Transforms a public.users row into a flat Typesense user document, or
 * `null` if the user must not be indexed at all.
 *
 * Only public profiles are indexed. This is the *only* thing keeping
 * non-public profiles out of search results: the scoped search key handed to
 * browsers carries no document filter, just a collection restriction (see
 * lib/scopedKey.ts). A profile that flips to non-public returns `null` here
 * and is then deleted from the index by lib/listener.ts, the same way an
 * unpublished comment is.
 */
export const transformUser = async (
  row: UserRow,
  deps: UserTransformDeps,
): Promise<TypesenseUserDocument | null> => {
  // Checked before touching Postgres: on a full reindex most rows are
  // non-public, and this saves a credential lookup for each of them.
  if (!row.hasPublicProfile) {
    return null
  }

  const listedCredential = await deps.getListedCredential(row.id)
  const credential = listedCredential?.description?.trim() || undefined
  const portraitUrl = getPortraitUrl(row.portraitUrl)

  // `.trim()` because getName trims each part but not the join: a row with a
  // blank firstName would otherwise index a leading space.
  const name = naming.getName(row).trim()

  const doc: TypesenseUserDocument = {
    id: row.id,
    name,
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
    doc.credentialVerified = !!listedCredential?.verified
  }
  if (portraitUrl) {
    doc.portrait = portraitUrl
  }

  return doc
}
