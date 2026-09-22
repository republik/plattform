import {
  buildDraftArticleDoc,
  resolveFormatDerivedFields,
  resolveFormatRepoId,
} from '../articleDoc'
import {
  repoIdToNewsletterId,
  repoIdToPageId,
  repoIdToPodcastId,
  repoIdToSanityId,
} from '../../legacyId'

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

  describe('articleCollections (format collection linking)', () => {
    it('links the featured articleCollection entry to the format when meta.format is set', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { format: 'https://github.com/republik/format-binswanger' },
      })

      expect(doc.articleCollections).toEqual([
        {
          _key: expect.any(String),
          _type: 'articleCollectionEntry',
          collection: {
            _type: 'reference',
            _ref: repoIdToSanityId('republik/format-binswanger'),
          },
          featured: true,
        },
      ])
    })

    it('is left unset when meta.format is missing or not a republik repo', () => {
      expect(
        buildDraftArticleDoc({ content: { children: [] }, meta: {} })
          .articleCollections,
      ).toBeUndefined()
      expect(
        buildDraftArticleDoc({
          content: { children: [] },
          meta: { format: 'https://example.com/not-a-repo' },
        }).articleCollections,
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

  describe('articleCollections — Vorgelesen entry', () => {
    it('adds the Vorgelesen collection when audioSourceKind is readAloud', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { audioSourceKind: 'readAloud' },
      })

      expect(doc.articleCollections).toEqual([
        {
          _key: expect.any(String),
          _type: 'articleCollectionEntry',
          collection: {
            _type: 'reference',
            _ref: repoIdToSanityId('republik/format-vorgelesen'),
          },
        },
      ])
    })

    it('adds both the format entry (featured) and the Vorgelesen entry', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: {
          format: 'https://github.com/republik/format-binswanger',
          audioSourceKind: 'readAloud',
        },
      })

      expect(doc.articleCollections).toHaveLength(2)
      expect(doc.articleCollections?.[0].featured).toBe(true)
      expect(doc.articleCollections?.[1].featured).toBeUndefined()
    })

    it('is left unset when neither a format nor readAloud audio applies', () => {
      const doc = buildDraftArticleDoc({ content: { children: [] }, meta: {} })
      expect(doc.articleCollections).toBeUndefined()
    })
  })

  describe('theme', () => {
    it('defaults to EDITORIAL with no accentColor/darkMode', () => {
      const doc = buildDraftArticleDoc({ content: { children: [] }, meta: {} })
      expect(doc.theme).toEqual({ _type: 'theme', name: 'EDITORIAL' })
    })

    it('is EDITORIAL_CENTERED when the TITLE zone is marked centered', () => {
      const doc = buildDraftArticleDoc({
        content: {
          children: [{ ...TITLE_ZONE, data: { center: true } }],
        },
        meta: {},
      })
      expect(doc.theme.name).toBe('EDITORIAL_CENTERED')
    })

    it('includes accentColor from the article’s own meta.color', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { color: '#ff0000' },
      })
      expect((doc.theme.accentColor as any)?.hex).toBe('#FF0000')
    })

    it('includes darkMode only when meta.darkMode is true', () => {
      expect(
        buildDraftArticleDoc({
          content: { children: [] },
          meta: { darkMode: true },
        }).theme.darkMode,
      ).toBe(true)
      expect(
        buildDraftArticleDoc({ content: { children: [] }, meta: {} }).theme
          .darkMode,
      ).toBeUndefined()
    })
  })

  describe('seo', () => {
    it('is left unset when nothing seo-related is present', () => {
      const doc = buildDraftArticleDoc({ content: { children: [] }, meta: {} })
      expect(doc.seo).toBeUndefined()
    })

    it('uses seoTitle/seoDescription, falling back to facebookTitle/facebookDescription', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: {
          facebookTitle: 'FB Titel',
          facebookDescription: 'FB Beschreibung',
        },
      })
      expect((doc.seo?.title?.[0] as any).children[0].text).toBe('FB Titel')
      expect((doc.seo?.description?.[0] as any).children[0].text).toBe(
        'FB Beschreibung',
      )
    })

    it('prefers seoTitle/seoDescription over the facebook fallback', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { seoTitle: 'SEO Titel', facebookTitle: 'FB Titel' },
      })
      expect((doc.seo?.title?.[0] as any).children[0].text).toBe('SEO Titel')
    })

    it('builds the share image from facebookImage, falling back to twitterImage', () => {
      const doc = buildDraftArticleDoc({
        repoId: 'republik/foo',
        content: { children: [] },
        meta: { twitterImage: 'https://cdn.repub.ch/s3/bucket/twitter.jpg' },
      })
      expect((doc.seo?.image as any)._sanityAsset).toMatch(/twitter\.jpg$/)
    })

    it('builds an imageBuilder with layout BACKGROUND_IMAGE when shareBackgroundImage is set', () => {
      const doc = buildDraftArticleDoc({
        repoId: 'republik/foo',
        content: { children: [] },
        meta: {
          shareText: 'Teile diesen Beitrag',
          shareBackgroundImage: 'https://cdn.repub.ch/s3/bucket/bg.jpg',
        },
      })
      expect(doc.seo?.useImageBuilder).toBe(true)
      expect(doc.seo?.imageBuilder?.layout).toBe('BACKGROUND_IMAGE')
      expect((doc.seo?.imageBuilder?.backgroundImage as any)._sanityAsset).toMatch(
        /bg\.jpg$/,
      )
      expect((doc.seo?.imageBuilder?.text?.[0] as any).children[0].text).toBe(
        'Teile diesen Beitrag',
      )
    })

    it('falls back to layout LOGO when there is a shareLogo but no shareBackgroundImage', () => {
      const doc = buildDraftArticleDoc({
        repoId: 'republik/foo',
        content: { children: [] },
        meta: { shareLogo: 'https://cdn.repub.ch/s3/bucket/logo.jpg' },
      })
      expect(doc.seo?.imageBuilder?.layout).toBe('LOGO')
      expect((doc.seo?.imageBuilder?.logo as any)._sanityAsset).toMatch(
        /logo\.jpg$/,
      )
    })
  })

  describe('trivial own-commit fields', () => {
    it('sets showInFeed from meta.feed when it is a boolean', () => {
      expect(
        buildDraftArticleDoc({
          content: { children: [] },
          meta: { feed: true },
        }).showInFeed,
      ).toBe(true)
      expect(
        buildDraftArticleDoc({ content: { children: [] }, meta: {} })
          .showInFeed,
      ).toBeUndefined()
    })

    it('derives readingAccess from isPaynoteExcluded/isPaywallExcluded, defaulting to REGWALL', () => {
      expect(
        buildDraftArticleDoc({
          content: { children: [] },
          meta: { isPaynoteExcluded: true },
        }).readingAccess,
      ).toBe('OPEN')
      expect(
        buildDraftArticleDoc({
          content: { children: [] },
          meta: { isPaywallExcluded: true },
        }).readingAccess,
      ).toBe('PAYNOTE')
      expect(
        buildDraftArticleDoc({ content: { children: [] }, meta: {} })
          .readingAccess,
      ).toBe('REGWALL')
    })

    it('inverts disableTextProgress into showTextProgress', () => {
      expect(
        buildDraftArticleDoc({
          content: { children: [] },
          meta: { disableTextProgress: true },
        }).showTextProgress,
      ).toBe(false)
      expect(
        buildDraftArticleDoc({ content: { children: [] }, meta: {} })
          .showTextProgress,
      ).toBe(true)
    })

    it('builds pushNotificationText from meta.shortTitle', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { shortTitle: 'Kurztitel' },
      })
      expect((doc.pushNotificationText?.[0] as any).children[0].text).toBe(
        'Kurztitel',
      )
    })

    it('builds emailSubject from meta.emailSubject', () => {
      const doc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { emailSubject: 'Betreff' },
      })
      expect((doc.emailSubject?.[0] as any).children[0].text).toBe('Betreff')
    })
  })

  describe('resolveFormatDerivedFields', () => {
    const baseDoc = buildDraftArticleDoc({
      content: { children: [] },
      meta: { format: 'https://github.com/republik/format-x' },
    })

    it('upgrades theme.name to META when the format has kind "meta"', () => {
      const result = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        undefined,
        'republik/format-x',
        { kind: 'meta', hasNewsletter: false, hasPodcast: false },
      )
      expect(result.theme.name).toBe('META')
    })

    it('upgrades theme.name to META when the format\'s section is a META_SECTION_REPOS entry', () => {
      const result = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        undefined,
        'republik/format-x',
        {
          sectionRepoId: 'republik/section-meta',
          hasNewsletter: false,
          hasPodcast: false,
        },
      )
      expect(result.theme.name).toBe('META')
    })

    it("fills accentColor from the format's color only when the article has none of its own", () => {
      const withoutOwnColor = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        undefined,
        'republik/format-x',
        { color: '#00ff00', hasNewsletter: false, hasPodcast: false },
      )
      expect((withoutOwnColor.theme.accentColor as any)?.hex).toBe('#00FF00')

      const ownColorDoc = buildDraftArticleDoc({
        content: { children: [] },
        meta: { format: 'https://github.com/republik/format-x', color: '#ff0000' },
      })
      const withOwnColor = resolveFormatDerivedFields(
        ownColorDoc,
        { format: 'republik/format-x', color: '#ff0000' },
        undefined,
        'republik/format-x',
        { color: '#00ff00', hasNewsletter: false, hasPodcast: false },
      )
      expect((withOwnColor.theme.accentColor as any)?.hex).toBe('#FF0000')
    })

    it("adds the format's section as a second, non-featured articleCollections entry", () => {
      const result = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        undefined,
        'republik/format-x',
        {
          sectionRepoId: 'republik/section-politik',
          hasNewsletter: false,
          hasPodcast: false,
        },
      )
      expect(result.articleCollections).toHaveLength(2)
      const sectionEntry = result.articleCollections?.[1]
      expect(sectionEntry?.featured).toBeUndefined()
      expect(sectionEntry?.collection._ref).toBe(
        repoIdToSanityId('republik/section-politik'),
      )
    })

    it('does not duplicate the section entry if it already matches the format entry', () => {
      const result = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        undefined,
        'republik/format-x',
        {
          sectionRepoId: 'republik/format-x',
          hasNewsletter: false,
          hasPodcast: false,
        },
      )
      expect(result.articleCollections).toHaveLength(1)
    })

    it('sets newsletter/podcast references only when the format has them', () => {
      const withBoth = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        undefined,
        'republik/format-x',
        { hasNewsletter: true, hasPodcast: true },
      )
      expect(withBoth.newsletter).toEqual({
        _type: 'reference',
        _ref: repoIdToNewsletterId('republik/format-x'),
      })
      expect(withBoth.podcast).toEqual({
        _type: 'reference',
        _ref: repoIdToPodcastId('republik/format-x'),
      })

      const withNeither = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        undefined,
        'republik/format-x',
        { hasNewsletter: false, hasPodcast: false },
      )
      expect(withNeither.newsletter).toBeUndefined()
      expect(withNeither.podcast).toBeUndefined()
    })

    it("falls back to the format's own shareBackgroundImage when the article has no share image of its own", () => {
      const result = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        'republik/foo',
        'republik/format-x',
        {
          shareBackgroundImage: 'https://cdn.repub.ch/s3/bucket/format-bg.jpg',
          hasNewsletter: false,
          hasPodcast: false,
        },
      )
      expect(result.seo?.imageBuilder?.layout).toBe('BACKGROUND_IMAGE')
      expect(
        (result.seo?.imageBuilder?.backgroundImage as any)?._sanityAsset,
      ).toMatch(/format-bg\.jpg$/)
    })

    it("fills teaserSmall.image from the format's image when the article has none of its own", () => {
      const result = resolveFormatDerivedFields(
        baseDoc,
        { format: 'republik/format-x' },
        undefined,
        'republik/format-x',
        {
          image: 'https://cdn.repub.ch/s3/bucket/format-teaser.jpg',
          hasNewsletter: false,
          hasPodcast: false,
        },
      )
      expect((result.teaserSmall?.image as any)?._sanityAsset).toMatch(
        /format-teaser\.jpg$/,
      )
    })

    it("never overrides an article's own teaserSmall.image", () => {
      const docWithOwnImage = buildDraftArticleDoc({
        repoId: 'republik/foo',
        content: { children: [] },
        meta: {
          format: 'https://github.com/republik/format-x',
          image: 'https://cdn.repub.ch/s3/bucket/own.jpg',
        },
      })
      const result = resolveFormatDerivedFields(
        docWithOwnImage,
        { format: 'republik/format-x', image: 'https://cdn.repub.ch/s3/bucket/own.jpg' },
        'republik/foo',
        'republik/format-x',
        {
          image: 'https://cdn.repub.ch/s3/bucket/format-teaser.jpg',
          hasNewsletter: false,
          hasPodcast: false,
        },
      )
      expect((result.teaserSmall?.image as any)?._sanityAsset).toMatch(
        /own\.jpg$/,
      )
    })
  })
})
