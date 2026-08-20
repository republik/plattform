import { TYPESENSE_COLLECTION_PREFIX } from '@/lib/constants'

import { SUPPORTED_FILTERS } from './constants'

const getCollectionAlias = (collectionName) =>
  `${TYPESENSE_COLLECTION_PREFIX}-${collectionName}`

export const PER_PAGE = 25

export const buildPreview = (text, length = 240) => {
  if (!text) {
    return { string: '', more: false }
  }
  if (text.length <= length) {
    return { string: text, more: false }
  }
  const truncated = text.slice(0, length)
  const lastSpace = truncated.lastIndexOf(' ')
  return {
    string: lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated,
    more: true,
  }
}

/** Looks up a Typesense highlight snippet by its raw field name. */
export const getHighlight = (highlights, field) =>
  highlights?.find((h) => h.field === field)?.snippet

// doc.credits is a JSON-encoded CreditsNode[] (see republik/studio's
// shared/search/bylineToCredits.ts) -- the byline exactly as authored in
// Sanity, with internalLink spans already resolved to `/~slug` profile
// links server-side. Just needs parsing here.
const parseCredits = (credits) => {
  if (!credits) return undefined
  try {
    return JSON.parse(credits)
  } catch {
    return undefined
  }
}

// Shapes a Typesense article document into the TeaserListItemType TeaserActions
// expects (see apps/www/src/app/(sanity)/components/teaser/feed/teaser-actions.tsx),
// so search results can reuse it instead of the legacy ActionBar.
//
// audioSourceMp3/audioDurationMs aren't indexed yet -- Typesense's
// TypesenseArticleDocument only carries hasAudio/audioSourceKind today.
// PlayAction/AddToPlaylistAction already treat both as optional, so this
// passes them through as undefined until the schema grows those fields.
const buildTeaserActionsItem = (doc) => ({
  _id: doc.id,
  _type: 'article',
  slug: doc.slug || '',
  plainTitle: doc.title,
  audioSourceMp3: doc.audioSourceMp3 ?? undefined,
  audioDurationMs: doc.audioDurationMs ?? undefined,
  discussion: doc.discussionId
    ? { backendDiscussionId: doc.discussionId }
    : undefined,
  inlineDiscussion: false,
})

const buildDocumentEntity = (hit) => {
  const doc = hit.document
  return {
    kind: 'Document',
    id: doc.id,
    discussionId: doc.discussionId,
    teaserActionsItem: buildTeaserActionsItem(doc),
    title: doc.title,
    description: doc.description,
    plainTextBody: doc.plainTextBody,
    publishDate: doc.publishDate ? new Date(doc.publishDate).toISOString() : null,
    path: doc.slug || '',
    // The article-collection ("Spitzmarke") kicker line -- only a title
    // (+ the article's own accentColor), no path (Typesense doesn't carry
    // collection slugs), so it renders as plain text rather than a link.
    format: doc.collections?.length
      ? { title: doc.collections[0], color: doc.accentColor }
      : undefined,
    credits: parseCredits(doc.credits),
    highlights: hit.highlights || [],
  }
}

const buildUserEntity = (hit) => {
  const doc = hit.document
  return {
    kind: 'User',
    id: doc.id,
    slug: doc.username || doc.id,
    name: doc.name,
    portrait: doc.portrait || null,
    credential: doc.credential
      ? { description: doc.credential, verified: !!doc.credentialVerified }
      : null,
    highlights: hit.highlights || [],
  }
}

const buildCommentEntity = (hit) => {
  const doc = hit.document
  const displayAuthor = doc.authorName
    ? {
        id: doc.authorId,
        name: doc.authorName,
        slug: doc.authorSlug,
        portrait: doc.authorPortrait || null,
        credential: doc.authorCredential
          ? {
              description: doc.authorCredential,
              verified: !!doc.authorCredentialVerified,
            }
          : null,
      }
    : null

  return {
    kind: 'Comment',
    id: doc.id,
    createdAt: new Date(doc.createdAt).toISOString(),
    tag: doc.tag || undefined,
    // Fallback body text for a plain '*' query, where Typesense returns no
    // highlight snippet at all.
    preview: buildPreview(doc.contentString),
    displayAuthor,
    discussionId: doc.discussionId,
    discussionPath: doc.articlePath || null,
    highlights: hit.highlights || [],
  }
}

/** What each Typesense collection carries, independent of which tab is asking. */
const COLLECTIONS = {
  articles: {
    collectionName: 'articles',
    queryBy: 'title,description,plainTextBody,authors,byline',
    toEntity: buildDocumentEntity,
  },
  users: {
    collectionName: 'users',
    queryBy: 'name,biography,statement',
    toEntity: buildUserEntity,
  },
  comments: {
    collectionName: 'comments',
    queryBy: 'contentString,authorName',
    toEntity: buildCommentEntity,
  },
}

// What distinguishes each kind from the collection it reads. Document and
// Audio are both the `articles` collection, Audio being the hasAudio:true
// subset -- there's no "all types" view, so every search fires all four
// requests in one multi_search to get the tab counts, and returns
// hits/pageInfo only for the selected one.
const KIND_COLLECTIONS = {
  Document: { ...COLLECTIONS.articles, filterBy: undefined },
  Audio: { ...COLLECTIONS.articles, filterBy: 'hasAudio:true' },
  User: { ...COLLECTIONS.users, filterBy: undefined },
  Comment: { ...COLLECTIONS.comments, filterBy: undefined },
}

/**
 * The four searchable kinds, built from the tab list in constants.js so the
 * tabs and the searches behind them cannot drift apart.
 *
 * Frozen because identity is load-bearing: buildRequest compares
 * `descriptor === selected` and buildSearchResult uses KINDS.indexOf() to pick
 * the matching multi_search result, so a reorder or mutation would silently
 * return the wrong collection's hits.
 */
export const KINDS = Object.freeze(
  SUPPORTED_FILTERS.map(({ kind, key, value }) =>
    Object.freeze({
      ...KIND_COLLECTIONS[kind],
      kind,
      filter: Object.freeze({ key, value }),
    }),
  ),
)

const DEFAULT_DESCRIPTOR = KINDS[0]

/** The descriptor a url filter selects, defaulting to Document. */
export const filterToDescriptor = (filter) =>
  KINDS.find(
    (d) => d.filter.key === filter?.key && d.filter.value === filter?.value,
  ) || DEFAULT_DESCRIPTOR

const sortByFor = (collectionName, sort) => {
  if (!sort || sort.key === 'relevance' || !sort.direction) {
    return '_text_match:desc'
  }
  const direction = sort.direction.toLowerCase()
  const field = collectionName === 'articles' ? 'publishDate' : 'createdAt'
  return `${field}:${direction}`
}

const buildRequest = (descriptor, { searchQuery, sort, selected, page }) => {
  const isSelected = descriptor === selected
  return {
    collection: getCollectionAlias(descriptor.collectionName),
    q: searchQuery || '*',
    query_by: descriptor.queryBy,
    ...(descriptor.filterBy ? { filter_by: descriptor.filterBy } : {}),
    highlight_fields: descriptor.queryBy,
    highlight_start_tag: '<em>',
    highlight_end_tag: '</em>',
    sort_by: sortByFor(descriptor.collectionName, sort),
    page: isSelected ? page : 1,
    per_page: isSelected ? PER_PAGE : 0,
  }
}

// Kinds sharing a filter key share an aggregation: type covers
// Document/User/Comment, audioSourceKind covers Audio on its own.
const buildAggregations = (foundByKind) => {
  const byFilterKey = new Map()
  KINDS.forEach((descriptor) => {
    if (!byFilterKey.has(descriptor.filter.key)) {
      byFilterKey.set(descriptor.filter.key, [])
    }
    byFilterKey.get(descriptor.filter.key).push(descriptor)
  })

  return [...byFilterKey].map(([key, descriptors]) => ({
    key,
    count: descriptors.reduce(
      (sum, descriptor) => sum + (foundByKind[descriptor.kind] || 0),
      0,
    ),
    buckets: descriptors.map((descriptor) => ({
      value: descriptor.filter.value,
      count: foundByKind[descriptor.kind] || 0,
    })),
  }))
}

/**
 * Reshapes a multi_search response (one result per KINDS entry, in order)
 * into the { nodes, totalCount, aggregations, pageInfo } shape the Search
 * components consume. Pure -- separated from runSearch so it can be unit
 * tested. Each node is the entity itself (kind/id/... + a raw `highlights`
 * array) -- there's no separate legacy node/entity wrapper.
 */
export const buildSearchResult = (results, { selected, page }) => {
  const foundByKind = {}
  KINDS.forEach((descriptor, index) => {
    foundByKind[descriptor.kind] = results[index]?.found ?? 0
  })

  const selectedResult = results[KINDS.indexOf(selected)]
  const nodes = (selectedResult?.hits || []).map((hit) => selected.toEntity(hit))
  const found = selectedResult?.found ?? 0

  return {
    totalCount: found,
    aggregations: buildAggregations(foundByKind),
    // Typesense paginates by 1-based page number, and the store knows which
    // pages it holds -- so there's nothing for a cursor to carry.
    pageInfo: { hasNextPage: page * PER_PAGE < found },
    nodes,
  }
}

/**
 * Runs one multi_search across articles/articles(hasAudio)/users/comments and
 * reshapes the response (see buildSearchResult).
 */
export const runSearch = async (
  client,
  { searchQuery, filter, sort, page = 1 },
) => {
  const selected = filterToDescriptor(filter)
  const searches = KINDS.map((descriptor) =>
    buildRequest(descriptor, { searchQuery, sort, selected, page }),
  )
  const { results } = await client.multiSearch.perform({ searches })
  return buildSearchResult(results, { selected, page })
}
