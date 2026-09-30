// See textToSpeech.u.jest.ts for this suite's testing policy.
//
// The expectations below are the actual repo names of existing Publikator
// format repos — the identifiers Huebsch has been receiving all along from
// the legacy republik/tts service. Getting these byte-identical is the whole
// point of porting styleguide's `slug()` rather than reaching for any other
// slugify.

import { resolveFormatId, slugify } from '../format'

describe('resolveFormatId', () => {
  it('slugifies a Spitzmarke into its republik/format-* identifier', () => {
    expect(resolveFormatId('Was diese Woche wichtig war')).toBe(
      'republik/format-was-diese-woche-wichtig-war',
    )
    expect(resolveFormatId('Briefing aus Bern')).toBe(
      'republik/format-briefing-aus-bern',
    )
  })

  it('transliterates umlauts the German way (ü -> ue, not u)', () => {
    expect(resolveFormatId('Am Gericht: Zürich')).toBe(
      'republik/format-am-gericht-zuerich',
    )
    expect(resolveFormatId('Grüsse aus Österreich')).toBe(
      'republik/format-gruesse-aus-oesterreich',
    )
  })

  it('collapses punctuation and whitespace runs into single hyphens', () => {
    expect(resolveFormatId('  Klima —  Was jetzt?!  ')).toBe(
      'republik/format-klima-was-jetzt',
    )
  })

  it('falls back to republik/article when there is no Spitzmarke', () => {
    expect(resolveFormatId(undefined)).toBe('republik/article')
    expect(resolveFormatId(null)).toBe('republik/article')
    expect(resolveFormatId('')).toBe('republik/article')
  })

  it('falls back to republik/article when a Spitzmarke slugifies to nothing', () => {
    expect(resolveFormatId('—?!')).toBe('republik/article')
  })

  describe('TTS_FORMAT_REPO_PREFIX override', () => {
    const ORIGINAL_PREFIX = process.env.TTS_FORMAT_REPO_PREFIX

    afterEach(() => {
      if (ORIGINAL_PREFIX === undefined) {
        delete process.env.TTS_FORMAT_REPO_PREFIX
      } else {
        process.env.TTS_FORMAT_REPO_PREFIX = ORIGINAL_PREFIX
      }
    })

    it('uses TTS_FORMAT_REPO_PREFIX in place of "republik" when set, e.g. for a clickable GitHub URL while testing', () => {
      process.env.TTS_FORMAT_REPO_PREFIX = 'https://github.com/republik'

      expect(resolveFormatId('Briefing aus Bern')).toBe(
        'https://github.com/republik/format-briefing-aus-bern',
      )
      expect(resolveFormatId(undefined)).toBe(
        'https://github.com/republik/article',
      )
    })
  })
})

describe('slugify', () => {
  it('drops soft hyphens rather than turning them into separators', () => {
    expect(slugify('Bundes­rat')).toBe('bundesrat')
  })

  it('transliterates ß to ss', () => {
    expect(slugify('Strassenmass — Maß')).toBe('strassenmass-mass')
  })
})
