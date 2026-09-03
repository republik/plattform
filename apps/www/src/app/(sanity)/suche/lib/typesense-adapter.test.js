import {
  KINDS,
  PER_PAGE,
  buildPreview,
  buildSearchResult,
  getHighlight,
  filterToDescriptor,
} from './typesense-adapter'
import { SUPPORTED_FILTERS, filterLabelKey } from './constants'
import { t } from '@/lib/withT'

const kind = (name) => KINDS.find((descriptor) => descriptor.kind === name)

// One entry per KINDS descriptor, in order: Document, Audio, User, Comment.
const multiSearchResults = ({
  documents = { found: 0, hits: [] },
  audio = { found: 0, hits: [] },
  users = { found: 0, hits: [] },
  comments = { found: 0, hits: [] },
} = {}) => [documents, audio, users, comments]

const articleHit = (document, highlights = []) => ({ document, highlights })

describe('filterToDescriptor', () => {
  it.each([
    [{ key: 'type', value: 'Document' }, 'Document'],
    [{ key: 'type', value: 'User' }, 'User'],
    [{ key: 'type', value: 'Comment' }, 'Comment'],
    [{ key: 'audioSourceKind', value: 'readAloud' }, 'Audio'],
  ])('maps %o to the %s descriptor', (filter, name) => {
    expect(filterToDescriptor(filter)).toBe(kind(name))
  })

  it('falls back to Document for unknown or missing filters', () => {
    expect(filterToDescriptor(undefined)).toBe(kind('Document'))
    expect(filterToDescriptor({ key: 'nope', value: 'nope' })).toBe(
      kind('Document'),
    )
  })

  it('routes both article tabs at the same collection', () => {
    expect(kind('Document').collectionName).toBe('articles')
    expect(kind('Audio').collectionName).toBe('articles')
    expect(kind('Audio').filterBy).toBe('hasAudio:true')
  })
})

// buildRequest compares descriptors by identity and buildSearchResult uses
// KINDS.indexOf() to pick the matching multi_search result, so a reorder or
// mutation would silently return the wrong collection's hits.
describe('KINDS', () => {
  it('follows the tab order in constants.js', () => {
    expect(KINDS.map((descriptor) => descriptor.kind)).toEqual(
      SUPPORTED_FILTERS.map((filter) => filter.kind),
    )
  })

  it('is frozen, descriptors and filters included', () => {
    expect(Object.isFrozen(KINDS)).toBe(true)
    KINDS.forEach((descriptor) => {
      expect(Object.isFrozen(descriptor)).toBe(true)
      expect(Object.isFrozen(descriptor.filter)).toBe(true)
    })
  })
})

// Filters.js renders each tab as t(filterLabelKey(filter)), so every filter
// needs a matching key. createFormatter returns the key itself when it is
// missing, which is what this catches.
describe('filter tab translations', () => {
  it.each(SUPPORTED_FILTERS)('has a label for %o', (filter) => {
    const key = filterLabelKey(filter)
    expect(t(key)).not.toBe(key)
  })
})

describe('getHighlight', () => {
  const highlights = [
    { field: 'title', snippet: '<em>Titel</em>' },
    { field: 'plainTextBody', value: 'roh' },
  ]

  it('finds a snippet by field name', () => {
    expect(getHighlight(highlights, 'title')).toBe('<em>Titel</em>')
  })

  it('is undefined for a field with no snippet, or missing highlights', () => {
    expect(getHighlight(highlights, 'plainTextBody')).toBeUndefined()
    expect(getHighlight(highlights, 'nope')).toBeUndefined()
    expect(getHighlight(undefined, 'title')).toBeUndefined()
  })
})

describe('buildPreview', () => {
  it('returns short text untruncated', () => {
    expect(buildPreview('kurz')).toEqual({ string: 'kurz', more: false })
  })

  it('truncates at the last word boundary', () => {
    const text = `${'a'.repeat(100)} ${'b'.repeat(200)}`
    expect(buildPreview(text)).toEqual({ string: 'a'.repeat(100), more: true })
  })

  it('hard-truncates when there is no word boundary', () => {
    const text = 'a'.repeat(300)
    expect(buildPreview(text)).toEqual({ string: 'a'.repeat(240), more: true })
  })

  it('handles missing text', () => {
    expect(buildPreview(undefined)).toEqual({ string: '', more: false })
  })
})

describe('buildSearchResult — aggregations', () => {
  it('groups buckets by aggregation key and sums the group count', () => {
    const result = buildSearchResult(
      multiSearchResults({
        documents: { found: 10, hits: [] },
        audio: { found: 4, hits: [] },
        users: { found: 3, hits: [] },
        comments: { found: 2, hits: [] },
      }),
      { selected: kind('Document'), page: 1 },
    )

    expect(result.aggregations).toEqual([
      {
        key: 'type',
        count: 15,
        buckets: [
          { value: 'Document', count: 10 },
          { value: 'User', count: 3 },
          { value: 'Comment', count: 2 },
        ],
      },
      {
        key: 'audioSourceKind',
        count: 4,
        buckets: [{ value: 'readAloud', count: 4 }],
      },
    ])
  })
})

describe('buildSearchResult — pageInfo', () => {
  const withFound = (found, page) =>
    buildSearchResult(multiSearchResults({ documents: { found, hits: [] } }), {
      selected: kind('Document'),
      page,
    }).pageInfo

  it('reports a next page on the first of several', () => {
    expect(withFound(PER_PAGE * 3, 1)).toEqual({ hasNextPage: true })
  })

  it('reports a next page in the middle', () => {
    expect(withFound(PER_PAGE * 3, 2)).toEqual({ hasNextPage: true })
  })

  it('reports no next page on the last', () => {
    expect(withFound(PER_PAGE * 3, 3)).toEqual({ hasNextPage: false })
  })

  it('reports no next page when a partial last page is exhausted', () => {
    expect(withFound(PER_PAGE + 1, 2)).toEqual({ hasNextPage: false })
  })

  it('keeps the exact totalCount', () => {
    const result = buildSearchResult(
      multiSearchResults({ documents: { found: 51, hits: [] } }),
      { selected: kind('Document'), page: 3 },
    )
    expect(result.totalCount).toBe(51)
  })
})

describe('buildSearchResult — document entities', () => {
  const build = (document, highlights) =>
    buildSearchResult(
      multiSearchResults({
        documents: { found: 1, hits: [articleHit(document, highlights)] },
      }),
      { selected: kind('Document'), page: 1 },
    ).nodes[0]

  it('maps the core fields', () => {
    const node = build({
      id: 'repo-1',
      discussionId: 'disc-1',
      title: 'Titel',
      description: 'Lead',
      publishDate: '2026-01-02T03:04:05.000Z',
      slug: '/2026/01/02/titel',
    })

    expect(node).toMatchObject({
      kind: 'Document',
      id: 'repo-1',
      discussionId: 'disc-1',
      title: 'Titel',
      description: 'Lead',
      publishDate: '2026-01-02T03:04:05.000Z',
      path: '/2026/01/02/titel',
    })
  })

  it('parses credits and tolerates malformed JSON', () => {
    const credits = [{ type: 'text', value: 'Von ' }]
    expect(
      build({ id: 'a', credits: JSON.stringify(credits) }).credits,
    ).toEqual(credits)
    expect(build({ id: 'a', credits: '{oops' }).credits).toBeUndefined()
    expect(build({ id: 'a' }).credits).toBeUndefined()
  })

  it('only sets format when the document has collections', () => {
    expect(
      build({ id: 'a', collections: ['Republik'], accentColor: '#000' })
        .format,
    ).toEqual({ title: 'Republik', color: '#000' })
    expect(build({ id: 'a', collections: [] }).format).toBeUndefined()
    expect(build({ id: 'a' }).format).toBeUndefined()
  })

  it('carries the raw Typesense highlights through unchanged', () => {
    const highlights = [
      { field: 'title', snippet: '<em>Titel</em>' },
      { field: 'plainTextBody', snippet: '<em>Text</em>' },
    ]
    const node = build({ id: 'a' }, highlights)

    expect(node.highlights).toEqual(highlights)
  })
})

describe('buildSearchResult — user entities', () => {
  const build = (document) =>
    buildSearchResult(
      multiSearchResults({ users: { found: 1, hits: [articleHit(document)] } }),
      { selected: kind('User'), page: 1 },
    ).nodes[0]

  it('maps a credentialled user', () => {
    expect(
      build({
        id: 'u1',
        username: 'anna',
        name: 'Anna',
        portrait: 'https://example.org/a.png',
        credential: 'Autorin',
        credentialVerified: true,
      }),
    ).toMatchObject({
      kind: 'User',
      id: 'u1',
      slug: 'anna',
      name: 'Anna',
      portrait: 'https://example.org/a.png',
      credential: { description: 'Autorin', verified: true },
    })
  })

  it('falls back to the id as slug and no credential/portrait', () => {
    const entity = build({ id: 'u2', name: 'Bea' })
    expect(entity.slug).toBe('u2')
    expect(entity.credential).toBeNull()
    expect(entity.portrait).toBeNull()
  })
})

describe('buildSearchResult — comment entities', () => {
  const build = (document) =>
    buildSearchResult(
      multiSearchResults({
        comments: { found: 1, hits: [articleHit(document)] },
      }),
      { selected: kind('Comment'), page: 1 },
    ).nodes[0]

  it('maps an authored comment attached to an article', () => {
    const entity = build({
      id: 'c1',
      createdAt: '2026-01-02T03:04:05.000Z',
      contentString: 'Ein Beitrag',
      tag: 'Frage',
      discussionId: 'disc-1',
      articlePath: '/2026/01/02/titel',
      authorId: 'u1',
      authorName: 'Anna',
      authorSlug: 'anna',
      authorCredential: 'Autorin',
      authorCredentialVerified: true,
    })

    expect(entity).toMatchObject({
      kind: 'Comment',
      id: 'c1',
      createdAt: '2026-01-02T03:04:05.000Z',
      tag: 'Frage',
      discussionId: 'disc-1',
      discussionPath: '/2026/01/02/titel',
      preview: { string: 'Ein Beitrag', more: false },
    })
    expect(entity.displayAuthor).toMatchObject({
      id: 'u1',
      name: 'Anna',
      slug: 'anna',
      credential: { description: 'Autorin', verified: true },
    })
  })

  it('handles a comment with no author and no article', () => {
    const entity = build({ id: 'c2', createdAt: '2026-01-02T03:04:05.000Z' })
    expect(entity.displayAuthor).toBeNull()
    expect(entity.tag).toBeUndefined()
    expect(entity.discussionPath).toBeNull()
  })
})
