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
  firstName: string | null
  lastName: string | null
}

export interface CommentTransformDeps {
  getUser: (userId: string) => Promise<UserRow | null>
  getDiscussion: (discussionId: string) => Promise<DiscussionRow | null>
  getDiscussionPreferences: (
    userId: string,
    discussionId: string,
  ) => Promise<DiscussionPreferencesRow | null>
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
    pgdb.public.users.findOne({ id: userId }, { fields: ['firstName', 'lastName'] }),
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
})

const toUnixMs = (value: Date | string | number): number =>
  new Date(value).getTime()

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
    }
  }

  if (discussion?.path) {
    doc.articlePath = discussion.path
  }

  return doc
}
