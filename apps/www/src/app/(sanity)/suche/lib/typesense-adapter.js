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

// doc.credits is a JSON-encoded CreditsNode[] (see studio's bylineToCredits.ts),
// already resolved to `/~slug` links server-side.
const parseCredits = (credits) => {
  if (!credits) return undefined
  try {
    return JSON.parse(credits)
  } catch {
    return undefined
  }
}

// Shapes a Typesense article into the shape TeaserActions expects, so
// search results can reuse it instead of the legacy ActionBar.
// audioSourceMp3/audioDurationMs aren't indexed yet, hence undefined --
// PlayAction/AddToPlaylistAction already treat both as optional.
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
    // Spitzmarke kicker -- plain text, not a link: Typesense has no collection slug.
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

// Document and Audio both read `articles`, Audio filtered to hasAudio:true.
// Every search fires all four in one multi_search (for the tab counts),
// returning hits/pageInfo only for the selected one.
const KIND_COLLECTIONS = {
  Document: { ...COLLECTIONS.articles, filterBy: undefined },
  Audio: { ...COLLECTIONS.articles, filterBy: 'hasAudio:true' },
  User: { ...COLLECTIONS.users, filterBy: undefined },
  Comment: { ...COLLECTIONS.comments, filterBy: undefined },
}

// Built from constants.js's tab list so tabs and searches can't drift apart.
// Frozen because identity is load-bearing: buildRequest compares by
// reference and buildSearchResult uses KINDS.indexOf() to match results.
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

// Reshapes a multi_search response (one result per KINDS entry, in order)
// into what the Search components consume. Pure, so it's separately testable.
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
