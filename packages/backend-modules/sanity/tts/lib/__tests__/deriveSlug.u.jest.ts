// Adapted from studio's shared/slug/deriveSlug.test.ts — this port takes an
// already-extracted plain-text title (not Portable Text; this package's own
// plainTitle/plainText helpers handle that step), so cases exercised there
// aren't repeated here.

import { deriveSlug, slugifySlugSource } from '../deriveSlug'

const NOW = new Date('2026-07-31T09:00:00.000Z')

describe('slugifySlugSource', () => {
  it('preserves `/` so date segments stay path separators', () => {
    expect(slugifySlugSource('/2026/07/31/Mein Titel')).toBe(
      '/2026/07/31/mein-titel',
    )
  })

  it('transliterates German umlauts the German way (ü -> ue, not u)', () => {
    expect(slugifySlugSource('/Grüezi Zürich – schön!')).toBe(
      '/grueezi-zuerich-schoen',
    )
  })

  it('transliterates ß -> ss', () => {
    expect(slugifySlugSource('Straße')).toBe('strasse')
  })
})

describe('deriveSlug', () => {
  it('derives `/yyyy/MM/dd/titel` from title and publishDate', () => {
    expect(deriveSlug('Mein Titel', '2026-08-01T05:00:00.000Z', NOW)).toBe(
      '/2026/08/01/mein-titel',
    )
  })

  it('always starts with `/` so the schema rule is satisfied', () => {
    const slug = deriveSlug('Titel', '2026-08-01T05:00:00.000Z', NOW)
    expect(slug?.startsWith('/')).toBe(true)
  })

  it('returns null when there is no title to derive from', () => {
    expect(deriveSlug('', '2026-08-01T05:00:00.000Z', NOW)).toBeNull()
  })

  it('returns null when the title slugifies away entirely', () => {
    // Punctuation-only leaves the bare date path, which is not a usable slug.
    expect(deriveSlug('!?—', '2026-08-01T05:00:00.000Z', NOW)).toBeNull()
  })

  describe('date basis', () => {
    it('falls back to `now` when publishDate is absent', () => {
      expect(deriveSlug('Titel', undefined, NOW)).toBe('/2026/07/31/titel')
      expect(deriveSlug('Titel', null, NOW)).toBe('/2026/07/31/titel')
    })

    it('falls back to `now` when publishDate does not parse', () => {
      expect(deriveSlug('Titel', 'nicht-ein-datum', NOW)).toBe(
        '/2026/07/31/titel',
      )
    })

    it('prefers publishDate over `now` when both are usable', () => {
      expect(deriveSlug('Titel', '2027-01-02T12:00:00.000Z', NOW)).toBe(
        '/2027/01/02/titel',
      )
    })
  })

  describe('Spitzmarke segment', () => {
    it('combines segment and title with the default template', () => {
      expect(
        deriveSlug('Der Titel', '2026-08-01T05:00:00.000Z', NOW, {
          segment: 'justiz',
        }),
      ).toBe('/2026/08/01/justiz-der-titel')
    })

    it('places the segment as a postfix via a custom template', () => {
      expect(
        deriveSlug('Der Titel', '2026-08-01T05:00:00.000Z', NOW, {
          segment: 'justiz',
          template: '{{title}}-{{segment}}',
        }),
      ).toBe('/2026/08/01/der-titel-justiz')
    })

    it('uses a `{{segment}}`-only template for a fixed daily address', () => {
      expect(
        deriveSlug('Egal welcher Titel', '2026-08-01T05:00:00.000Z', NOW, {
          segment: 'republik-heute',
          template: '{{segment}}',
        }),
      ).toBe('/2026/08/01/republik-heute')
    })

    it('degrades to the segment alone when there is no title yet', () => {
      expect(
        deriveSlug('', '2026-08-01T05:00:00.000Z', NOW, {
          segment: 'justiz',
        }),
      ).toBe('/2026/08/01/justiz')
    })

    it('ignores a blank segment, falling back to title-only', () => {
      expect(
        deriveSlug('Der Titel', '2026-08-01T05:00:00.000Z', NOW, {
          segment: '   ',
        }),
      ).toBe('/2026/08/01/der-titel')
    })

    it('is unaffected by a heading with no segment (regression)', () => {
      expect(
        deriveSlug('Der Titel', '2026-08-01T05:00:00.000Z', NOW, {}),
      ).toBe('/2026/08/01/der-titel')
    })
  })

  describe('Europe/Zurich boundary', () => {
    // Bare UTC formatting would resolve the wrong calendar day near
    // midnight in Zurich — these pin the Zurich wall-clock date so this
    // preview can't disagree with what slug-freeze-publish derives later.
    it('keeps a late-evening summer instant on the same Zurich day', () => {
      // 21:30Z in CEST (UTC+2) is 23:30 on 31 July, not 1 August.
      expect(deriveSlug('Titel', '2026-07-31T21:30:00.000Z', NOW)).toBe(
        '/2026/07/31/titel',
      )
    })

    it('rolls a past-midnight summer instant to the next Zurich day', () => {
      // 22:30Z in CEST is 00:30 on 1 August.
      expect(deriveSlug('Titel', '2026-07-31T22:30:00.000Z', NOW)).toBe(
        '/2026/08/01/titel',
      )
    })

    it('rolls a past-midnight winter instant to the next Zurich day', () => {
      // 23:30Z in CET (UTC+1) is 00:30 on 16 January.
      expect(deriveSlug('Titel', '2026-01-15T23:30:00.000Z', NOW)).toBe(
        '/2026/01/16/titel',
      )
    })

    it('applies the same zone to the `now` fallback', () => {
      expect(
        deriveSlug('Titel', undefined, new Date('2026-07-31T22:30:00.000Z')),
      ).toBe('/2026/08/01/titel')
    })
  })
})
