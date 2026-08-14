import {
  KINDS,
  PER_PAGE,
  buildPreview,
  buildSearchResult,
  estimateReadingMinutes,
  filterToDescriptor,
} from './typesenseAdapter'
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

describe('estimateReadingMinutes', () => {
  it('is undefined for empty text', () => {
    expect(estimateReadingMinutes('')).toBeUndefined()
    expect(estimateReadingMinutes(undefined)).toBeUndefined()
  })

  it('is undefined at or below one minute of reading', () => {
    expect(estimateReadingMinutes('wort '.repeat(180))).toBeUndefined()
  })

  it('rounds to whole minutes above the threshold', () => {
    expect(estimateReadingMinutes('wort '.repeat(540))).toBe(3)
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

    expect(node.entity).toMatchObject({
      __typename: 'Document',
      id: 'repo-1',
      repoId: 'repo-1',
      discussionId: 'disc-1',
    })
    expect(node.entity.meta).toMatchObject({
      title: 'Titel',
      description: 'Lead',
      publishDate: '2026-01-02T03:04:05.000Z',
      path: '/2026/01/02/titel',
      template: 'article',
    })
  })

  it('parses credits and tolerates malformed JSON', () => {
    const credits = [{ type: 'text', value: 'Von ' }]
    expect(
      build({ id: 'a', credits: JSON.stringify(credits) }).entity.meta.credits,
    ).toEqual(credits)
    expect(
      build({ id: 'a', credits: '{oops' }).entity.meta.credits,
    ).toBeUndefined()
    expect(build({ id: 'a' }).entity.meta.credits).toBeUndefined()
  })

  it('only sets format when the document has collections', () => {
    expect(
      build({ id: 'a', collections: ['Republik'], accentColor: '#000' }).entity
        .meta.format,
    ).toEqual({ meta: { title: 'Republik', color: '#000' } })
    expect(
      build({ id: 'a', collections: [] }).entity.meta.format,
    ).toBeUndefined()
    expect(build({ id: 'a' }).entity.meta.format).toBeUndefined()
  })

  it('maps highlight fields onto the paths the result components look up', () => {
    const node = build({ id: 'a' }, [
      { field: 'title', snippet: '<em>Titel</em>' },
      { field: 'plainTextBody', snippet: '<em>Text</em>' },
      { field: 'unmapped', value: 'roh' },
    ])

    expect(node.highlights).toEqual([
      { path: 'meta.title', fragments: ['<em>Titel</em>'] },
      { path: 'contentString', fragments: ['<em>Text</em>'] },
      { path: 'unmapped', fragments: ['roh'] },
    ])
  })
})

describe('buildSearchResult — user entities', () => {
  const build = (document) =>
    buildSearchResult(
      multiSearchResults({ users: { found: 1, hits: [articleHit(document)] } }),
      { selected: kind('User'), page: 1 },
    ).nodes[0].entity

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
    ).toEqual({
      __typename: 'User',
      id: 'u1',
      slug: 'anna',
      firstName: 'Anna',
      lastName: '',
      portrait: 'https://example.org/a.png',
      credentials: [{ description: 'Autorin', verified: true, isListed: true }],
    })
  })

  it('falls back to the id as slug and an empty credentials list', () => {
    const entity = build({ id: 'u2', name: 'Bea' })
    expect(entity.slug).toBe('u2')
    expect(entity.credentials).toEqual([])
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
    ).nodes[0].entity

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
      __typename: 'Comment',
      id: 'c1',
      createdAt: '2026-01-02T03:04:05.000Z',
      published: true,
      tags: ['Frage'],
      parentIds: [],
      preview: { string: 'Ein Beitrag', more: false },
    })
    expect(entity.displayAuthor).toMatchObject({
      id: 'u1',
      name: 'Anna',
      slug: 'anna',
      credential: { id: 'u1', description: 'Autorin', verified: true },
    })
    expect(entity.discussion).toEqual({
      id: 'disc-1',
      title: '',
      path: '/2026/01/02/titel',
      document: {
        id: null,
        meta: { template: 'article', path: '/2026/01/02/titel' },
      },
    })
  })

  it('handles a comment with no author and no article', () => {
    const entity = build({ id: 'c2', createdAt: '2026-01-02T03:04:05.000Z' })
    expect(entity.displayAuthor).toBeNull()
    expect(entity.tags).toEqual([])
    expect(entity.discussion.path).toBeNull()
    expect(entity.discussion.document).toBeNull()
  })
})
