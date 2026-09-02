import { buildDraftArticleDoc } from '../articleDoc'

const TITLE_ZONE = {
  type: 'zone',
  identifier: 'TITLE',
  children: [
    { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Der Titel' }] },
    { type: 'paragraph', children: [{ type: 'text', value: 'Die Lead-Zeile' }] },
  ],
}

describe('publikatorSync/articleDoc buildDraftArticleDoc', () => {
  it('assembles title/description/content/slug/publishDate from a commit', () => {
    const commit = {
      content: {
        children: [
          TITLE_ZONE,
          { type: 'paragraph', children: [{ type: 'text', value: 'Body text' }] },
        ],
      },
      meta: { slug: 'der-titel', publishDate: '2024-01-01T00:00:00.000Z' },
    }

    const doc = buildDraftArticleDoc(commit)

    expect(doc._type).toBe('article')
    expect((doc.title?.[0] as any).children[0].text).toBe('Der Titel')
    expect((doc.description?.[0] as any).children[0].text).toBe('Die Lead-Zeile')
    expect((doc.content[0] as any).children[0].text).toBe('Body text')
    expect(doc.slug).toEqual({ _type: 'slug', current: 'der-titel' })
    expect(doc.publishDate).toBe('2024-01-01T00:00:00.000Z')
  })

  // meta.path (the full dated route) is only ever computed at publish time
  // and never written back into the commits row this hook reads — using it
  // here (an earlier version of this file did) meant the slug was silently
  // dropped for every synced article, autoSlug-derived or not.
  it('ignores meta.path — it is never populated on a raw commit row', () => {
    const commit = {
      content: { children: [] },
      meta: { path: '/2024/01/01/der-titel', slug: 'der-titel' },
    }

    const doc = buildDraftArticleDoc(commit)

    expect(doc.slug).toEqual({ _type: 'slug', current: 'der-titel' })
  })

  it('keeps only the last segment of a slashed manual slug, matching getPath()', () => {
    const commit = {
      content: { children: [] },
      meta: { slug: 'custom/nested/slug' },
    }

    const doc = buildDraftArticleDoc(commit)

    expect(doc.slug).toEqual({ _type: 'slug', current: 'slug' })
  })

  it('omits slug/publishDate when meta.slug/publishDate are absent', () => {
    const commit = {
      content: { children: [{ type: 'paragraph', children: [{ type: 'text', value: 'x' }] }] },
      meta: {},
    }

    const doc = buildDraftArticleDoc(commit)

    expect(doc.slug).toBeUndefined()
    expect(doc.publishDate).toBeUndefined()
  })

  it('handles a commit with no content gracefully', () => {
    const doc = buildDraftArticleDoc({ content: {}, meta: {} } as never)

    expect(doc._type).toBe('article')
    expect(doc.content).toEqual([])
    expect(doc.title).toBeUndefined()
  })
})
