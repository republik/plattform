// See textToSpeech.u.jest.ts for this suite's testing policy.

import { compactTimestamp, titleSlugFrom } from '../filename'

describe('titleSlugFrom', () => {
  it('takes the last segment of a slash-separated slug', () => {
    expect(titleSlugFrom('/2026/07/16/henning-voice-test', 'fallback')).toBe(
      'henning-voice-test',
    )
  })

  it('falls back to the sanitized fallback when the slug is missing', () => {
    expect(titleSlugFrom(undefined, 'drafts.edd72d5c-180e-430f')).toBe(
      'drafts-edd72d5c-180e-430f',
    )
  })

  it('falls back when the slug is an empty string', () => {
    expect(titleSlugFrom('', 'fallback-id')).toBe('fallback-id')
  })

  it('sanitizes uppercase, umlauts, and punctuation into a lowercase-hyphenated label', () => {
    expect(titleSlugFrom('/2026/07/16/Über Uns!?', 'fallback')).toBe('ber-uns')
  })

  it('is idempotent — re-sanitizing an already-sanitized value is a no-op', () => {
    const first = titleSlugFrom('/2026/07/16/henning-voice-test', 'fallback')
    expect(titleSlugFrom(first, 'fallback')).toBe(first)
  })

  it('falls back to "audio" when the slug sanitizes to nothing at all', () => {
    expect(titleSlugFrom('///', 'fallback')).toBe('fallback')
    expect(titleSlugFrom('!!!', 'fallback')).toBe('audio')
  })
})

describe('compactTimestamp', () => {
  it('formats an ISO timestamp as YYYYMMDD-HHMMSS (UTC)', () => {
    expect(compactTimestamp('2026-07-16T10:35:59.123Z')).toBe('20260716-103559')
  })
})
