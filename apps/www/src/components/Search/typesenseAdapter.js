import { parse } from 'graphql'

const PREFIX = process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION_PREFIX || 'republik'
const getCollectionAlias = (kind) => `${PREFIX}-${kind}`

const PER_PAGE = 25

const QUERY_BY = {
  articles: 'title,description,plainTextBody,authors,byline',
  comments: 'contentString,authorName',
  users: 'name,biography,statement',
}

// Typesense highlight field names -> the dotted paths findHighlight() in the
// result components looks up (matching the old Elasticsearch resolver's
// highlight paths, so DocumentResult/CommentResult/UserResult stay unchanged).
const HIGHLIGHT_PATH = {
  articles: {
    title: 'meta.title',
    description: 'meta.description',
    authors: 'meta.authors',
    plainTextBody: 'contentString',
  },
  comments: {
    contentString: 'contentString',
  },
  users: {
    name: 'name',
    biography: 'biography',
    statement: 'statement',
  },
}

// Backend labels from packages/backend-modules/translate/translations.json
// (api/search/aggs/type/*, api/search/aggs/audioSourceKind/readAloud) --
// duplicated here since these were previously resolved server-side and the
// frontend has no equivalent translation keys for them.
const LABELS = {
  Document: 'Artikel',
  User: 'Profile',
  Comment: 'Debattenbeiträge',
  Audio: 'Vorgelesen',
}

// Document/Audio are both the `articles` collection under different
// filters (Audio is the hasAudio:true subset) -- there's no "all types"
// view, so every keystroke fires all four requests in one multi_search to
// get tab counts, and returns hits/pageInfo only for the selected one.
const FILTER_REQUESTS = [
  { kind: 'Document', collection: 'articles', filterBy: undefined },
  { kind: 'Audio', collection: 'articles', filterBy: 'hasAudio:true' },
  { kind: 'User', collection: 'users', filterBy: undefined },
  { kind: 'Comment', collection: 'comments', filterBy: undefined },
]

export const filterToKind = (filter) => {
  if (filter?.key === 'type' && filter.value === 'User') return 'User'
  if (filter?.key === 'type' && filter.value === 'Comment') return 'Comment'
  if (filter?.key === 'audioSourceKind' && filter.value === 'readAloud')
    return 'Audio'
  return 'Document'
}

const sortByFor = (collection, sort) => {
  if (!sort || sort.key === 'relevance' || !sort.direction) {
    return '_text_match:desc'
  }
  const direction = sort.direction.toLowerCase()
  const field = collection === 'articles' ? 'publishDate' : 'createdAt'
  return `${field}:${direction}`
}

const buildRequest = (filterRequest, { searchQuery, sort, selectedKind, page }) => {
  const isSelected = filterRequest.kind === selectedKind
  return {
    collection: getCollectionAlias(filterRequest.collection),
    q: searchQuery || '*',
    query_by: QUERY_BY[filterRequest.collection],
    ...(filterRequest.filterBy ? { filter_by: filterRequest.filterBy } : {}),
    highlight_fields: QUERY_BY[filterRequest.collection],
    highlight_start_tag: '<em>',
    highlight_end_tag: '</em>',
    sort_by: sortByFor(filterRequest.collection, sort),
    page: isSelected ? page : 1,
    per_page: isSelected ? PER_PAGE : 0,
  }
}

const buildHighlights = (hit, collectionKind) => {
  const pathByField = HIGHLIGHT_PATH[collectionKind]
  return (hit.highlights || []).map((highlight) => ({
    path: pathByField[highlight.field] || highlight.field,
    fragments: [highlight.snippet || highlight.value || ''],
  }))
}

const buildPreview = (text, length = 240) => {
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
const estimateReadingMinutes = (text) => {
  if (!text) return undefined
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return words > WORDS_PER_MINUTE ? Math.round(words / WORDS_PER_MINUTE) : undefined
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
    // enrichDocumentNodes() reads to batch-fetch ownDiscussion, then merges
    // the result into meta itself. Ignored by DocumentResult/TeaserFeed.
    discussionId: doc.discussionId,
    meta: {
      title: doc.title,
      description: doc.description,
      publishDate: doc.publishDate ? new Date(doc.publishDate).toISOString() : null,
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

const buildEntity = (collectionKind, hit) => {
  if (collectionKind === 'users') return buildUserEntity(hit)
  if (collectionKind === 'comments') return buildCommentEntity(hit)
  return buildDocumentEntity(hit)
}

const buildAggregations = (foundByKind) => [
  {
    key: 'type',
    count: foundByKind.Document + foundByKind.User + foundByKind.Comment,
    label: 'Typ',
    buckets: [
      { value: 'Document', count: foundByKind.Document, label: LABELS.Document },
      { value: 'User', count: foundByKind.User, label: LABELS.User },
      { value: 'Comment', count: foundByKind.Comment, label: LABELS.Comment },
    ],
  },
  {
    key: 'audioSourceKind',
    count: foundByKind.Audio,
    label: 'Audio',
    buckets: [{ value: 'readAloud', count: foundByKind.Audio, label: LABELS.Audio }],
  },
]

/**
 * Runs one multi_search across articles/articles(hasAudio)/users/comments and
 * reshapes the response into the SearchConnection-like contract the Search
 * components already consume (see enhancers.js's previous GraphQL query).
 */
export const runSearch = async (client, { searchQuery, filter, sort, page = 1 }) => {
  const selectedKind = filterToKind(filter)
  const searches = FILTER_REQUESTS.map((filterRequest) =>
    buildRequest(filterRequest, { searchQuery, sort, selectedKind, page }),
  )
  const { results } = await client.multiSearch.perform({ searches })

  const foundByKind = {}
  FILTER_REQUESTS.forEach((filterRequest, index) => {
    foundByKind[filterRequest.kind] = results[index]?.found ?? 0
  })

  const selectedIndex = FILTER_REQUESTS.findIndex(
    (filterRequest) => filterRequest.kind === selectedKind,
  )
  const selectedResult = results[selectedIndex]
  const selectedCollectionKind = FILTER_REQUESTS[selectedIndex].collection

  const nodes = (selectedResult?.hits || []).map((hit) => ({
    entity: buildEntity(selectedCollectionKind, hit),
    highlights: buildHighlights(hit, selectedCollectionKind),
    score: hit.text_match,
  }))

  const found = selectedResult?.found ?? 0
  const hasNextPage = page * PER_PAGE < found

  return {
    totalCount: found,
    aggregations: buildAggregations(foundByKind),
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? String(page + 1) : null,
      hasPreviousPage: page > 1,
      startCursor: page > 1 ? String(page - 1) : null,
    },
    nodes,
  }
}

/**
 * Comment counts are live Postgres data (discussions.comments.totalCount) --
 * Typesense only carries the static discussionId join key (see
 * TypesenseArticleDocument#discussionId). This batches one aliased
 * `discussion(id:)` per Document-tab hit into a single GraphQL request
 * (each resolves via the Discussion.byId DataLoader, so it's one query, not
 * N) and merges { ownDiscussion } into each node's meta.
 */
export const enrichDocumentNodes = async (apolloClient, nodes) => {
  const withDiscussion = nodes
    .map((node, index) => ({ node, index, discussionId: node.entity.discussionId }))
    .filter((entry) => entry.discussionId)

  if (withDiscussion.length === 0) {
    return nodes
  }

  const query = parse(`
    query getSearchDiscussionCounts {
      ${withDiscussion
        .map(
          (entry, i) =>
            `d${i}: discussion(id: ${JSON.stringify(entry.discussionId)}) {
              id
              path
              closed
              comments(first: 0) { totalCount }
            }`,
        )
        .join('\n')}
    }
  `)

  const { data } = await apolloClient.query({ query, fetchPolicy: 'network-only' })

  const ownDiscussionByIndex = new Map(
    withDiscussion.map((entry, i) => [entry.index, data[`d${i}`]]),
  )

  return nodes.map((node, index) => {
    const ownDiscussion = ownDiscussionByIndex.get(index)
    if (!ownDiscussion) {
      return node
    }
    return {
      ...node,
      entity: { ...node.entity, meta: { ...node.entity.meta, ownDiscussion } },
    }
  })
}
