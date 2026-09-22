import {
  assetRef,
  bodyChildren,
  extractTitleZoneData,
  mdastToPortableText,
  multilineEditorFromString,
  toDirectS3Url,
} from '../mdastToPortableText'

describe('publikatorSync/mdastToPortableText', () => {
  it('converts a plain paragraph into a normal block', () => {
    const result = mdastToPortableText([
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Hello world' }],
      },
    ]) as Array<Record<string, unknown>>

    expect(result).toHaveLength(1)
    expect(result[0]._type).toBe('block')
    expect(result[0].style).toBe('normal')
    const children = result[0].children as Array<Record<string, unknown>>
    expect(children[0].text).toBe('Hello world')
  })

  it('drops empty paragraphs', () => {
    const result = mdastToPortableText([
      { type: 'paragraph', children: [{ type: 'text', value: '   ' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'Real text' }] },
    ]) as Array<Record<string, unknown>>

    expect(result).toHaveLength(1)
  })

  it('styles the question paragraph and voice-tags the answer', () => {
    const nodes = [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Wie geht es Ihnen?' }],
      },
      {
        type: 'zone',
        identifier: 'INTERVIEWANSWER',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Mir geht es gut.' }],
          },
        ],
      },
    ]

    const result = mdastToPortableText(
      nodes,
      false,
      undefined,
      'huebsch-62964-rpblk',
    ) as Array<Record<string, unknown>>

    expect(result).toHaveLength(2)
    const [question, answer] = result
    expect(question.style).toBe('interviewQuestion')

    const answerChildren = answer.children as Array<Record<string, unknown>>
    expect(answerChildren[0]).toMatchObject({
      _type: 'voiceTag',
      voice: 'huebsch-62964-rpblk',
    })
  })

  it('extracts title/description/byline from a TITLE zone', () => {
    const nodes = [
      {
        type: 'zone',
        identifier: 'TITLE',
        children: [
          {
            type: 'heading',
            depth: 1,
            children: [{ type: 'text', value: 'Der Titel' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Die Lead-Zeile' }],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Von Jane Doe' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Body text' }],
      },
    ]

    const { title, description, byline } = extractTitleZoneData(nodes)
    expect((title?.[0] as any).children[0].text).toBe('Der Titel')
    expect((description?.[0] as any).children[0].text).toBe('Die Lead-Zeile')
    expect((byline?.[0] as any).children[0].text).toBe('Von Jane Doe')

    const body = mdastToPortableText(
      bodyChildren(nodes),
    ) as Array<Record<string, unknown>>
    expect(body).toHaveLength(1)
    expect(((body[0].children as any[])[0] as any).text).toBe('Body text')
  })

  it('flags centered when the TITLE zone carries data.center', () => {
    const centered = extractTitleZoneData([
      { type: 'zone', identifier: 'TITLE', data: { center: true }, children: [] },
    ])
    expect(centered.centered).toBe(true)

    const notCentered = extractTitleZoneData([
      { type: 'zone', identifier: 'TITLE', children: [] },
    ])
    expect(notCentered.centered).toBeUndefined()
  })

  it('multilineEditorFromString: one block per non-empty line', () => {
    const blocks = multilineEditorFromString(
      '  Erste Zeile  \n\n  Zweite Zeile\n',
    ) as Array<Record<string, unknown>>

    expect(blocks).toHaveLength(2)
    expect(((blocks[0].children as any[])[0] as any).text).toBe('Erste Zeile')
    expect(((blocks[1].children as any[])[0] as any).text).toBe('Zweite Zeile')
  })

  describe('assetRef', () => {
    const OLD_ENV = process.env

    beforeEach(() => {
      process.env = {
        ...OLD_ENV,
        ASSETS_SERVER_BASE_URL: 'https://cdn.repub.ch',
        AWS_S3_BUCKET: 'republik-assets',
      }
    })

    afterAll(() => {
      process.env = OLD_ENV
    })

    it('turns an already-absolute URL into a direct-S3 marker', () => {
      expect(
        assetRef('https://cdn.repub.ch/s3/republik-assets/foo.jpg?size=1x1'),
      ).toBe(
        'image@https://republik-assets.s3.eu-central-1.amazonaws.com/foo.jpg',
      )
    })

    it('rewrites the republik.pink (love/staging) CDN alias too', () => {
      expect(toDirectS3Url('https://cdn.republik.pink/s3/bucket/foo.jpg')).toBe(
        'https://bucket.s3.eu-central-1.amazonaws.com/foo.jpg',
      )
    })

    // The raw commit row this hook reads directly from Postgres stores an
    // editor-uploaded image as a path relative to the repo's own asset
    // folder (`images/<hash>.ext`) — only resolved into an absolute URL at
    // Publikator's own render time, which this hook bypasses. Without a
    // repoId to resolve against, that relative path is indistinguishable
    // from garbage and must be dropped, not silently mis-synced.
    it('drops a relative "images/..." path when no repoId is given', () => {
      expect(assetRef('images/abc123.jpg?size=100x100')).toBeUndefined()
    })

    it('resolves a relative "images/..." path into a direct-S3 marker when repoId is given', () => {
      expect(
        assetRef('images/abc123.jpg?size=100x100', 'republik/foo'),
      ).toBe(
        'image@https://republik-assets.s3.eu-central-1.amazonaws.com/repos/republik/foo/images/abc123.jpg',
      )
    })

    it('leaves a non-image relative value alone (still not a valid asset)', () => {
      expect(assetRef('not-an-image-path', 'republik/foo')).toBeUndefined()
    })

    it('drops a data: URI regardless of repoId', () => {
      expect(assetRef('data:image/png;base64,abcd', 'republik/foo')).toBeUndefined()
    })
  })

  describe('resolving a relative image path end-to-end via mdastToPortableText/extractTitleZoneData', () => {
    const OLD_ENV = process.env
    const FIGURE_ZONE = {
      type: 'zone',
      identifier: 'FIGURE',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'image', url: 'images/cover-hash.jpg' }],
        },
      ],
    }

    beforeEach(() => {
      process.env = {
        ...OLD_ENV,
        ASSETS_SERVER_BASE_URL: 'https://cdn.repub.ch',
        AWS_S3_BUCKET: 'republik-assets',
      }
    })

    afterAll(() => {
      process.env = OLD_ENV
    })

    it('extractTitleZoneData resolves the cover image against the given repoId', () => {
      const { cover } = extractTitleZoneData(
        [FIGURE_ZONE, { type: 'zone', identifier: 'TITLE', children: [] }],
        true,
        'republik/foo',
      )

      expect((cover as any)._sanityAsset).toBe(
        'image@https://republik-assets.s3.eu-central-1.amazonaws.com/repos/republik/foo/images/cover-hash.jpg',
      )
    })

    it('mdastToPortableText resolves a body FIGURE image against the given repoId', () => {
      const [block] = mdastToPortableText(
        [FIGURE_ZONE],
        true,
        undefined,
        undefined,
        'republik/foo',
      ) as Array<Record<string, unknown>>

      expect(block._sanityAsset).toBe(
        'image@https://republik-assets.s3.eu-central-1.amazonaws.com/repos/republik/foo/images/cover-hash.jpg',
      )
    })
  })

  describe('contributor references', () => {
    const AUTHOR_ID = 'b4c26f2e-6c1f-4f00-8d1f-b1b4a3e1a697'

    it('flags an AUTHOR zone contributor ref for lookup, with a title hint from resolvedAuthor', () => {
      const [block] = mdastToPortableText([
        {
          type: 'zone',
          identifier: 'AUTHOR',
          data: {
            authorId: AUTHOR_ID,
            resolvedAuthor: { name: 'Nina Schick' },
          },
          children: [],
        },
      ]) as Record<string, any>[]

      expect(block.contributor._sanityContributor).toEqual({
        userId: AUTHOR_ID,
        title: 'Nina Schick',
      })
    })

    it('flags a /~<uuid> byline profile link for lookup, using the visible text as the title hint', () => {
      const [block] = mdastToPortableText([
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: `/~${AUTHOR_ID}`,
              children: [{ type: 'text', value: 'Nina Schick' }],
            },
          ],
        },
      ]) as Record<string, any>[]

      const markDef = block.markDefs[0]
      expect(markDef.reference._sanityContributor).toEqual({
        userId: AUTHOR_ID,
        title: 'Nina Schick',
      })
    })

    it('does not flag a /~<username> byline profile link (no real userId to look up)', () => {
      const [block] = mdastToPortableText([
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: '/~ninaschick',
              children: [{ type: 'text', value: 'Nina Schick' }],
            },
          ],
        },
      ]) as Record<string, any>[]

      const markDef = block.markDefs[0]
      expect(markDef.reference._sanityContributor).toBeUndefined()
      expect(markDef.reference._ref).toBeDefined()
    })
  })
})
