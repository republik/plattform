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
  it('assembles title/description/content/publishDate from a commit', () => {
    const commit = {
      content: {
        children: [
          TITLE_ZONE,
          { type: 'paragraph', children: [{ type: 'text', value: 'Body text' }] },
        ],
      },
      meta: { publishDate: '2024-01-01T00:00:00.000Z' },
    }

    const doc = buildDraftArticleDoc(commit)

    expect(doc._type).toBe('article')
    expect((doc.title?.[0] as any).children[0].text).toBe('Der Titel')
    expect((doc.description?.[0] as any).children[0].text).toBe('Die Lead-Zeile')
    expect((doc.content[0] as any).children[0].text).toBe('Body text')
    expect(doc.publishDate).toBe('2024-01-01T00:00:00.000Z')
  })

  describe('slugAuto / slug', () => {
    it('defaults to automatic (matching Publikator\'s own default) and leaves slug empty', () => {
      // Sanity's own publish action derives the slug from title + publishDate
      // at that point — this hook must not set one, only the slugAuto flag,
      // or it would fight Sanity's native automatic-slug machinery.
      const doc = buildDraftArticleDoc({ content: { children: [] }, meta: {} })

      expect(doc.slugAuto).toBe(true)
      expect(doc.slug).toBeUndefined()
    })

    it('stays automatic when meta.autoSlug is explicitly true, even if meta.slug has a value', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { autoSlug: true, slug: 'stale-auto-derived-value' },
      })

      expect(doc.slugAuto).toBe(true)
      expect(doc.slug).toBeUndefined()
    })

    it('switches to manual and date-prefixes meta.slug, matching getPath()', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: {
          autoSlug: false,
          slug: 'mein-eigener-slug',
          publishDate: '2024-03-05T00:00:00.000Z',
        },
      })

      expect(doc.slugAuto).toBe(false)
      expect(doc.slug).toEqual({
        _type: 'slug',
        current: '/2024/03/05/mein-eigener-slug',
      })
    })

    it('falls back to today\'s date when manual and publishDate is not set yet', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { autoSlug: false, slug: 'mein-slug' },
      })

      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/')
      expect(doc.slugAuto).toBe(false)
      expect(doc.slug).toEqual({ _type: 'slug', current: `/${today}/mein-slug` })
    })

    it('keeps only the last segment of a slashed manual slug, matching getPath()', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: {
          autoSlug: false,
          slug: 'custom/nested/slug',
          publishDate: '2024-01-01T00:00:00.000Z',
        },
      })

      expect(doc.slug).toEqual({ _type: 'slug', current: '/2024/01/01/slug' })
    })

    it('is manual with no slug value when autoSlug is off but meta.slug is empty', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { autoSlug: false },
      })

      expect(doc.slugAuto).toBe(false)
      expect(doc.slug).toBeUndefined()
    })

    // meta.path (the full dated route) is only ever computed at publish time
    // and never written back into the commits row this hook reads — using it
    // here (an earlier version of this file did) meant the slug was silently
    // dropped for every synced article, autoSlug included.
    it('ignores meta.path — it is never populated on a raw commit row', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { autoSlug: false, path: '/2024/01/01/der-titel', slug: 'der-titel' },
      })

      expect(doc.slug?.current).toBe(
        `/${new Date().toISOString().slice(0, 10).replace(/-/g, '/')}/der-titel`,
      )
    })
  })

  it('handles a commit with no content gracefully', () => {
    const doc = buildDraftArticleDoc({ content: {}, meta: {} } as never)

    expect(doc._type).toBe('article')
    expect(doc.content).toEqual([])
    expect(doc.title).toBeUndefined()
    expect(doc.slugAuto).toBe(true)
  })
})
