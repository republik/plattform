import { createSanityClient } from '@orbiting/backend-modules-sanity'

import { TypesenseArticleDocument } from '../collections'
import { blocksToPlainText } from './blocksToPlainText'
import { bylineToCredits } from './bylineToCredits'

/**
 * One GROQ query, fully dereferenced -- no follow-up fetches needed. Unlike
 * studio's functions/sync-search/index.ts (which resolves
 * articleCollections/contributors/discussion refs itself because its input
 * is an unresolved Blueprint event payload), this backend writes its own
 * query and can dereference everything inline with `->` and conditional
 * projections, the same way
 * packages/backend-modules/sanity/lib/article.ts#fetchArticleForNotification
 * already does.
 */
const QUERY = `
  *[
    _type in ["article", "page"]
    && !(_id in path("drafts.**"))
    && excludeFromSearch != true
  ]{
    _id,
    _type,
    title,
    byline[]{
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => { "contributorSlug": reference->slug.current }
      }
    },
    description,
    content,
    pageBuilder,
    "slug": slug.current,
    publishDate,
    readingAccess,
    "collectionTitles": articleCollections[].collection->title,
    "authorNames": contributors[].contributor->title,
    suppressSyntheticReadAloud,
    audioSourceMp3,
    audioDurationMs,
    "discussionId": discussion->backendDiscussionId,
    "accentColor": theme.accentColor.hex
  }
`

interface RawArticleDoc {
  _id: string
  _type: 'article' | 'page'
  title?: unknown
  byline?: unknown
  description?: unknown
  content?: unknown
  pageBuilder?: unknown
  slug?: string | null
  publishDate?: string | null
  readingAccess?: string | null
  collectionTitles?: string[]
  authorNames?: string[]
  suppressSyntheticReadAloud?: boolean
  audioSourceMp3?: string
  audioDurationMs?: number
  discussionId?: string | null
  accentColor?: string | null
}

const toTypesenseArticleDocument = (doc: RawArticleDoc): TypesenseArticleDocument => {
  const bodyBlocks = doc._type === 'article' ? doc.content : doc.pageBuilder
  const audioSourceKind = doc.audioSourceMp3
    ? 'produced'
    : !doc.suppressSyntheticReadAloud
      ? 'synthetic'
      : undefined
  const credits = bylineToCredits(doc.byline)

  return {
    id: doc._id,
    type: doc._type,
    title: blocksToPlainText(doc.title),
    byline: blocksToPlainText(doc.byline),
    description: blocksToPlainText(doc.description),
    plainTextBody: blocksToPlainText(bodyBlocks),
    slug: doc.slug ?? undefined,
    publishDate: doc.publishDate ? new Date(doc.publishDate).getTime() : 0,
    readingAccess: doc.readingAccess ?? undefined,
    collections: doc.collectionTitles ?? [],
    authors: doc.authorNames ?? [],
    credits: credits ? JSON.stringify(credits) : undefined,
    hasAudio: !!audioSourceKind,
    audioSourceKind,
    audioSourceMp3: doc.audioSourceMp3,
    audioDurationMs: doc.audioDurationMs,
    discussionId: doc.discussionId ?? undefined,
    accentColor: doc.accentColor ?? undefined,
    searchScope: 'public',
  }
}

/**
 * Fetches every published, searchable article/page and shapes each into a
 * TypesenseArticleDocument ready to import. See script/reindex.ts's
 * reindexArticles for how this feeds the blue/green collection swap the
 * other kinds already use.
 */
export const fetchSearchableArticles = async (): Promise<TypesenseArticleDocument[]> => {
  const docs = await createSanityClient().fetch<RawArticleDoc[]>(QUERY)
  return docs.map(toTypesenseArticleDocument)
}
