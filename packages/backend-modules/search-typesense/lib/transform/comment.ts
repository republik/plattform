// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  stringifyNode,
} = require('@orbiting/backend-modules-documents/lib/resolve')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { remark } = require('@orbiting/backend-modules-utils')

import { TypesenseCommentDocument } from '../collections'

/**
 * Minimal shape of a public.comments row needed to build a Typesense
 * comment document. Reference:
 * @orbiting/backend-modules-search/lib/inserts/comment.js
 */
export interface CommentRow {
  id: string
  content: string
  userId: string
  discussionId: string
  published: boolean
  adminUnpublished: boolean
  createdAt: Date | string | number
  tags: string[] | null
}

export interface DiscussionRow {
  id: string
  anonymity: string | null
  hidden: boolean
  /** Path of the article/document the discussion is attached to, if any. */
  path: string | null
}

export interface DiscussionPreferencesRow {
  anonymous: boolean | null
  credentialId: string | null
}

export interface UserRow {
  id: string
  firstName: string | null
  lastName: string | null
  username: string | null
  portraitUrl: string | null
}

export interface CredentialRow {
  description: string | null
  verified: boolean | null
}

export interface CommentTransformDeps {
  getUser: (userId: string) => Promise<UserRow | null>
  getDiscussion: (discussionId: string) => Promise<DiscussionRow | null>
  getDiscussionPreferences: (
    userId: string,
    discussionId: string,
  ) => Promise<DiscussionPreferencesRow | null>
  getCredential: (credentialId: string) => Promise<CredentialRow | null>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PgDb = any

/**
 * Builds `CommentTransformDeps` backed by live Postgres reads. Shared
 * between lib/listener.ts (real-time) and script/reindex.ts (bulk backfill)
 * so both query the exact same fields.
 */
export const makeCommentDeps = (pgdb: PgDb): CommentTransformDeps => ({
  getUser: async (userId) =>
    pgdb.public.users.findOne(
      { id: userId },
      { fields: ['id', 'firstName', 'lastName', 'username', 'portraitUrl'] },
    ),
  getDiscussion: async (discussionId) =>
    pgdb.public.discussions.findOne(
      { id: discussionId },
      { fields: ['id', 'anonymity', 'hidden', 'path'] },
    ),
  getDiscussionPreferences: async (userId, discussionId) =>
    pgdb.public.discussionPreferences.findOne(
      { userId, discussionId },
      { fields: ['anonymous', 'credentialId'] },
    ),
  getCredential: async (credentialId) =>
    pgdb.public.credentials.findOne(
      { id: credentialId },
      { fields: ['description', 'verified'] },
    ),
})

const toUnixMs = (value: Date | string | number): number =>
  new Date(value).getTime()

/**
 * Mirrors @orbiting/backend-modules-republik/lib/portrait's resize/bw URL
 * building (duplicated rather than depended on, to avoid a cross-package
 * import into a package that otherwise has no dependency on `republik`).
 */
const getPortraitUrl = (portraitUrl: string | null): string | undefined => {
  if (!portraitUrl) {
    return undefined
  }
  try {
    const url = new URL(portraitUrl)
    url.searchParams.set('resize', '384x384')
    url.searchParams.set('bw', '1')
    url.searchParams.set('format', 'auto')
    return url.toString()
  } catch {
    return undefined
  }
}

/**
 * A comment must never be present in the Typesense index if its discussion
 * is hidden, or if it is adminUnpublished, or if it isn't published.
 */
export const isCommentIndexable = (
  row: Pick<CommentRow, 'published' | 'adminUnpublished'>,
  discussion: Pick<DiscussionRow, 'hidden'> | null,
): boolean => {
  if (!row.published) {
    return false
  }
  if (row.adminUnpublished) {
    return false
  }
  if (!discussion || discussion.hidden) {
    return false
  }
  return true
}

/**
 * Transforms a public.comments row into a flat Typesense comment document,
 * or returns null if the comment must not be indexed (see
 * isCommentIndexable). Callers must delete any existing Typesense document
 * for this id when null is returned.
 */
export const transformComment = async (
  row: CommentRow,
  deps: CommentTransformDeps,
): Promise<TypesenseCommentDocument | null> => {
  const discussion = await deps.getDiscussion(row.discussionId)

  if (!isCommentIndexable(row, discussion)) {
    return null
  }

  const [user, discussionPreferences] = await Promise.all([
    deps.getUser(row.userId),
    deps.getDiscussionPreferences(row.userId, row.discussionId),
  ])

  const isAnonymityEnforced = discussion?.anonymity === 'ENFORCED'
  const isAnonymous = !!discussionPreferences?.anonymous

  const doc: TypesenseCommentDocument = {
    id: row.id,
    contentString: stringifyNode(remark.parse(row.content)),
    discussionId: row.discussionId,
    createdAt: toUnixMs(row.createdAt),
    searchScope: 'public',
  }

  if (user && !isAnonymityEnforced && !isAnonymous) {
    const authorName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()

    if (authorName) {
      doc.authorName = authorName
      doc.authorId = user.id
      doc.authorSlug = user.username || user.id

      const portraitUrl = getPortraitUrl(user.portraitUrl)
      if (portraitUrl) {
        doc.authorPortrait = portraitUrl
      }

      const credential = discussionPreferences?.credentialId
        ? await deps.getCredential(discussionPreferences.credentialId)
        : null
      const credentialDescription = credential?.description?.trim()
      if (credentialDescription) {
        doc.authorCredential = credentialDescription
        doc.authorCredentialVerified = !!credential?.verified
      }
    }
  }

  if (discussion?.path) {
    doc.articlePath = discussion.path
  }

  if (row.tags?.[0]) {
    doc.tag = row.tags[0]
  }

  return doc
}
