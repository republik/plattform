// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Ported from studio's functions/create-discussion/buildDiscussionDoc.ts —
// same namespace string, same id derivation, same field defaults — so a
// discussion this hook writes is indistinguishable from one that Sanity's
// own create-discussion Blueprint Function would have created.
//
// That Function fires whenever a published article has no linked discussion
// yet (or its slug changed) — which already happens on its own once this
// hook publishes an article, no help needed there. What it does NOT do is
// forward Publikator's meta.discussionClosed: its own buildDiscussionDoc
// hardcodes `discussionClosed: false` unconditionally, because the article
// document it reads has no such field. This module exists solely to carry
// that one value across — everything else here just matches the Function's
// own shape closely enough that create-discussion (whichever of the two
// runs first) never disagrees with what's already there.
import { v5 as uuidV5 } from 'uuid'
import { toPlainText } from '@portabletext/toolkit'

const DISCUSSION_NAMESPACE = uuidV5('ch.republik.studio.discussion', uuidV5.DNS)

// A minimal local equivalent of ../../tts's plainText — deliberately not
// imported from there: tts/index.ts pulls in @orbiting/backend-modules-assets
// (for its S3 mirroring), which does `checkEnv(['ASSETS_SERVER_BASE_URL'])`
// at module-load time — a heavy, env-var-requiring side effect this small
// title-extraction helper has no business dragging in.
function plainText(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return toPlainText(value as any).trim()
  } catch {
    return ''
  }
}

// Keyed on the ARTICLE's own Sanity _id (not the publikator repoId) — a
// separate namespace from repoIdToSanityId/legacyId.ts, matching
// create-discussion's own derivation exactly so both land on the same id.
export const discussionIdForArticle = (articleId: string): string =>
  uuidV5(articleId, DISCUSSION_NAMESPACE)

export interface DiscussionDoc {
  _id: string
  _type: 'discussion'
  title: string
  path?: string
  discussionClosed: boolean
  discussionAnonymity: string
  tagRequired: boolean
}

export function buildDiscussionDoc(
  articleId: string,
  article: { title?: unknown[]; slug?: { current?: string } },
  discussionClosed: boolean,
): DiscussionDoc {
  const path = article.slug?.current?.trim() || undefined
  // title is required on the discussion schema — falls back to the slug and
  // finally the article id, same order buildDiscussionDoc.ts uses, so it's
  // never left empty.
  const title = plainText(article.title) || path || articleId

  return {
    _id: discussionIdForArticle(articleId),
    _type: 'discussion',
    title,
    ...(path ? { path } : {}),
    discussionClosed,
    discussionAnonymity: 'ALLOWED',
    tagRequired: false,
  }
}
