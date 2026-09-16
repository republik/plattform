// SANITY_SYNC (transition period, removable — see ./index.ts).
import { v5 as uuidV5 } from 'uuid'
import { ConnectionContext } from '@orbiting/backend-modules-types'
import { sanityClient } from '../client'

// Mirrors studio's functions/create-discussion/buildDiscussionDoc.ts exactly
// (same namespace string, same DNS-based derivation) -- Studio derives a
// discussion document's Sanity _id deterministically from the PUBLISHED
// article's own Sanity _id, so this sync writes the same discussion doc
// Studio would create/reuse, not a competing one at a random _id.
const DISCUSSION_NAMESPACE = uuidV5('ch.republik.studio.discussion', uuidV5.DNS)

export const discussionIdForArticle = (articleSanityId: string): string =>
  uuidV5(articleSanityId, DISCUSSION_NAMESPACE)

export interface LegacyDiscussionRow {
  id: string
  title: string | null
  path: string | null
  closed: boolean | null
  hidden: boolean | null
  allowedRoles: string[] | null
  maxLength: number | null
  disableTopLevelComments: boolean | null
  collapsable: boolean | null
  defaultOrder: string | null
  anonymity: string | null
  tags: string[] | null
  tagRequired: boolean | null
}

// Postgres discussions column -> Sanity discussion document field. Mirrors
// (inverted) studio's functions/sync-discussion/index.ts payload shape --
// see that file for the Sanity -> Postgres direction. Values are passed as
// they are, nulls included: the legacy discussion is created and owned by
// Publikator and only synced from there, so Postgres is authoritative --
// there is no case where Sanity should already hold different data for a
// discussion belonging to an article that doesn't exist yet.
export function toSanityDiscussionFields(row: LegacyDiscussionRow) {
  return {
    title: row.title,
    path: row.path,
    discussionClosed: row.closed,
    discussionHidden: row.hidden,
    allowedRoles: row.allowedRoles,
    commentsMaxLength: row.maxLength,
    disableTopLevelComments: row.disableTopLevelComments,
    commentsCollapsable: row.collapsable,
    commentsDefaultOrder: row.defaultOrder,
    discussionAnonymity: row.anonymity,
    tags: row.tags,
    tagRequired: row.tagRequired,
    backendDiscussionId: row.id,
  }
}

export type DiscussionRef = { _type: 'reference'; _ref: string }

// Looks up the pre-existing legacy Postgres discussion for repoId (already
// upserted synchronously by publikator's publish resolver before this job's
// enqueue -- see publish.js's prepareMetaForPublish) and, if found,
// writes/refreshes the Sanity discussion doc Studio's own create-discussion
// function would derive for this article, so that function's
// `!defined(discussion)` trigger condition is already false by the time it
// would run. Returns undefined (a legitimate, common outcome for Sanity-
// native articles with no legacy discussion at all) when there's nothing to
// link -- callers must not treat that as an error.
export async function linkLegacyDiscussion(
  pgdb: ConnectionContext['pgdb'],
  repoId: string,
  articleSanityId: string,
): Promise<DiscussionRef | undefined> {
  const discussion = (await pgdb.public.discussions.findOne({
    repoId,
  })) as LegacyDiscussionRow | undefined
  if (!discussion) return undefined

  const discussionId = discussionIdForArticle(articleSanityId)
  await sanityClient().createOrReplace({
    _id: discussionId,
    _type: 'discussion',
    ...toSanityDiscussionFields(discussion),
  })

  return { _type: 'reference', _ref: discussionId }
}
