import { buildDraftArticleDoc, resolveFormatRepoId } from '../articleDoc'
import { repoIdToPageId } from '../../legacyId'

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

  describe('heading (Spitzmarke / format connection)', () => {
    it('references the format\'s page id when meta.format is a republik GitHub URL', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { format: 'https://github.com/republik/format-binswanger' },
      })

      expect(doc.heading).toEqual({
        _type: 'reference',
        _ref: repoIdToPageId('republik/format-binswanger'),
        _weak: true,
      })
    })

    it('accepts the bare "republik/<repo>" shorthand', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { format: 'republik/format-am-gericht' },
      })

      expect(doc.heading?._ref).toBe(
        repoIdToPageId('republik/format-am-gericht'),
      )
    })

    it('leaves heading unset when meta.format is missing or not a republik repo', () => {
      expect(
        buildDraftArticleDoc({ content: { children: [] }, meta: {} }).heading,
      ).toBeUndefined()
      expect(
        buildDraftArticleDoc({
          content: { children: [] },
          meta: { format: 'https://example.com/not-a-repo' },
        }).heading,
      ).toBeUndefined()
    })
  })

  describe('resolveFormatRepoId', () => {
    it('normalizes a full GitHub URL to owner/repo', () => {
      expect(
        resolveFormatRepoId({
          format: 'https://github.com/republik/format-binswanger',
        }),
      ).toBe('republik/format-binswanger')
    })

    it('returns undefined for a non-republik value', () => {
      expect(resolveFormatRepoId({ format: 'acme/other-repo' })).toBeUndefined()
      expect(resolveFormatRepoId({})).toBeUndefined()
    })
  })

  describe('cover', () => {
    const FIGURE_ZONE = {
      type: 'zone',
      identifier: 'FIGURE',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'image', url: 'https://cdn.repub.ch/s3/bucket/cover.jpg' },
          ],
        },
      ],
    }

    it('is included, with an unresolved asset marker, when a FIGURE zone precedes TITLE', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [FIGURE_ZONE, TITLE_ZONE] },
        meta: {},
      })

      expect(doc.cover).toBeDefined()
      expect((doc.cover as any)._sanityAsset).toMatch(
        /^image@https:\/\/bucket\.s3\.eu-central-1\.amazonaws\.com\/cover\.jpg$/,
      )
    })

    // The common real-world case: an editor-uploaded cover image is stored
    // on the raw commit as a path relative to the repo's own asset folder,
    // only ever resolved to an absolute URL at Publikator's own render time
    // — which this hook bypasses (see mdastToPortableText.ts#
    // resolveRepoImagePath). Without repoId, this used to be silently
    // dropped: no `_sanityAsset`, so no upload, so no cover in Sanity at all.
    it('resolves a relative "images/..." cover path via the commit repoId', () => {
      const OLD_ENV = process.env
      process.env = {
        ...OLD_ENV,
        ASSETS_SERVER_BASE_URL: 'https://cdn.repub.ch',
        AWS_S3_BUCKET: 'republik-assets',
      }
      try {
        const doc = buildDraftArticleDoc({
          repoId: 'republik/foo',
          content: {
            children: [
              {
                type: 'zone',
                identifier: 'FIGURE',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      { type: 'image', url: 'images/cover-hash.jpg' },
                    ],
                  },
                ],
              },
              TITLE_ZONE,
            ],
          },
          meta: {},
        })

        expect((doc.cover as any)._sanityAsset).toBe(
          'image@https://republik-assets.s3.eu-central-1.amazonaws.com/repos/republik/foo/images/cover-hash.jpg',
        )
      } finally {
        process.env = OLD_ENV
      }
    })

    it('is left unset when there is no FIGURE zone before TITLE', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [TITLE_ZONE] },
        meta: {},
      })

      expect(doc.cover).toBeUndefined()
    })
  })

  describe('teaserSmall.image', () => {
    it('is built from meta.image', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { image: 'https://cdn.repub.ch/s3/bucket/teaser.jpg' },
      })

      expect(doc.teaserSmall?._type).toBe('teaserSmallConfig')
      expect((doc.teaserSmall?.image as any)._sanityAsset).toMatch(
        /^image@https:\/\/bucket\.s3\.eu-central-1\.amazonaws\.com\/teaser\.jpg$/,
      )
    })

    it('is left unset when the article has no meta.image (left to the format fallback)', () => {
      const doc = buildDraftArticleDoc({ content: { children: [] }, meta: {} })

      expect(doc.teaserSmall).toBeUndefined()
    })

    // Same real-world relative-path case as the cover test above: this is
    // the common shape for meta.image on a raw commit row.
    it('resolves a relative "images/..." meta.image via the commit repoId', () => {
      const OLD_ENV = process.env
      process.env = {
        ...OLD_ENV,
        ASSETS_SERVER_BASE_URL: 'https://cdn.repub.ch',
        AWS_S3_BUCKET: 'republik-assets',
      }
      try {
        const doc = buildDraftArticleDoc({
          repoId: 'republik/foo',
          content: { children: [] },
          meta: { image: 'images/teaser-hash.jpg?size=100x100' },
        })

        expect((doc.teaserSmall?.image as any)._sanityAsset).toBe(
          'image@https://republik-assets.s3.eu-central-1.amazonaws.com/repos/republik/foo/images/teaser-hash.jpg',
        )
      } finally {
        process.env = OLD_ENV
      }
    })
  })
})
