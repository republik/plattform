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

// Matches packages/backend-modules/documents/lib/meta.js's
// getEstimatedReadingMinutes (word count / 180wpm, backend-computed there
// from an Elasticsearch stored field) -- derived client-side here since
// Typesense only carries the plain text itself.
const WORDS_PER_MINUTE = 180
export const estimateReadingMinutes = (text) => {
  if (!text) return undefined
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return words > WORDS_PER_MINUTE
    ? Math.round(words / WORDS_PER_MINUTE)
    : undefined
}

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

const buildDocumentEntity = (hit) => {
  const doc = hit.document
  return {
    __typename: 'Document',
    id: doc.id,
    repoId: doc.id,
    // Not part of the old Document contract -- an internal passthrough field
    // addOwnDiscussions() reads to batch-fetch ownDiscussion, then merges
    // the result into meta itself. Ignored by DocumentResult/TeaserFeed.
    // This is the durable join key: repoIds disappear once documents live
    // only in Sanity, discussionIds do not.
    discussionId: doc.discussionId,
    meta: {
      title: doc.title,
      description: doc.description,
      publishDate: doc.publishDate
        ? new Date(doc.publishDate).toISOString()
        : null,
      path: doc.slug || '',
      // All indexed documents are Sanity `article`s (see decision to only
      // index kind:article) -- ActionBar's reading-time/audio gating checks
      // this exact value.
      template: 'article',
      estimatedConsumptionMinutes: estimateReadingMinutes(doc.plainTextBody),
      // The article-collection ("Spitzmarke") kicker line -- only a title
      // (+ the article's own accentColor), no path (Typesense doesn't carry
      // collection slugs), so it renders as plain text rather than a link.
      format: doc.collections?.length
        ? { meta: { title: doc.collections[0], color: doc.accentColor } }
        : undefined,
      credits: parseCredits(doc.credits),
    },
  }
}

const buildUserEntity = (hit) => {
  const doc = hit.document
  return {
    __typename: 'User',
    id: doc.id,
    slug: doc.username || doc.id,
    firstName: doc.name,
    lastName: '',
    portrait: doc.portrait || null,
    credentials: doc.credential
      ? [
          {
            description: doc.credential,
            verified: !!doc.credentialVerified,
            isListed: true,
          },
        ]
      : [],
  }
}

const buildCommentEntity = (hit) => {
  const doc = hit.document
  const displayAuthor = doc.authorName
    ? {
        id: doc.authorId,
        name: doc.authorName,
        slug: doc.authorSlug,
        profilePicture: doc.authorPortrait || null,
        credential: doc.authorCredential
          ? {
              id: doc.authorId,
              description: doc.authorCredential,
              verified: !!doc.authorCredentialVerified,
            }
          : null,
      }
    : null

  return {
    __typename: 'Comment',
    id: doc.id,
    createdAt: new Date(doc.createdAt).toISOString(),
    published: true,
    tags: doc.tag ? [doc.tag] : [],
    parentIds: [],
    preview: buildPreview(doc.contentString),
    displayAuthor,
    // discussion.title isn't carried by the Typesense comments collection --
    // DiscussionFooter's title link renders empty text rather than crashing.
    // discussion.document.meta.template is hardcoded to 'article' since every
    // indexed comment with an articlePath is attached to an article; this
    // only drives CommentLink's /dialog url prefix, not layout/rendering.
    discussion: {
      id: doc.discussionId,
      title: '',
      path: doc.articlePath || null,
      document: doc.articlePath
        ? { id: null, meta: { template: 'article', path: doc.articlePath } }
        : null,
    },
  }
}

/**
 * What each Typesense collection carries, independent of which tab is asking.
 *
 * `highlightPaths` maps Typesense highlight field names onto the dotted paths
 * findHighlight() in the result components looks up (matching the old
 * Elasticsearch resolver's highlight paths, so DocumentResult/CommentResult/
 * UserResult stay unchanged).
 */
const COLLECTIONS = {
  articles: {
    collectionName: 'articles',
    queryBy: 'title,description,plainTextBody,authors,byline',
    highlightPaths: {
      title: 'meta.title',
      description: 'meta.description',
      authors: 'meta.authors',
      plainTextBody: 'contentString',
    },
    toEntity: buildDocumentEntity,
  },
  users: {
    collectionName: 'users',
    queryBy: 'name,biography,statement',
    highlightPaths: {
      name: 'name',
      biography: 'biography',
      statement: 'statement',
    },
    toEntity: buildUserEntity,
  },
  comments: {
    collectionName: 'comments',
    queryBy: 'contentString,authorName',
    highlightPaths: {
      contentString: 'contentString',
    },
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

const buildHighlights = (hit, descriptor) =>
  (hit.highlights || []).map((highlight) => ({
    path: descriptor.highlightPaths[highlight.field] || highlight.field,
    fragments: [highlight.snippet || highlight.value || ''],
  }))

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
 * tested.
 */
export const buildSearchResult = (results, { selected, page }) => {
  const foundByKind = {}
  KINDS.forEach((descriptor, index) => {
    foundByKind[descriptor.kind] = results[index]?.found ?? 0
  })

  const selectedResult = results[KINDS.indexOf(selected)]

  const nodes = (selectedResult?.hits || []).map((hit) => ({
    entity: selected.toEntity(hit),
    highlights: buildHighlights(hit, selected),
  }))

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
