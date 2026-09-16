import {
  Feature,
  hasFeature,
  isEnabledForRequest,
  parseFeatureHeader,
} from '../featureFlags'

describe('parseFeatureHeader', () => {
  it('returns an empty set for an undefined header', () => {
    expect(parseFeatureHeader(undefined)).toEqual(new Set())
  })

  it('returns an empty set for an empty string', () => {
    expect(parseFeatureHeader('')).toEqual(new Set())
  })

  it('parses a single recognized token', () => {
    expect(parseFeatureHeader('sanity')).toEqual(new Set(['sanity']))
  })

  it('trims whitespace around tokens', () => {
    expect(parseFeatureHeader(' sanity , sanity ')).toEqual(new Set(['sanity']))
  })

  it('dedupes repeated tokens', () => {
    expect(parseFeatureHeader('sanity,sanity')).toEqual(new Set(['sanity']))
  })

  it('silently ignores unrecognized tokens', () => {
    expect(parseFeatureHeader('sanity,totallyMadeUp')).toEqual(new Set(['sanity']))
    expect(parseFeatureHeader('totallyMadeUp')).toEqual(new Set())
  })

  it('joins an array-valued header (repeated Express headers)', () => {
    expect(parseFeatureHeader(['sanity', 'totallyMadeUp'])).toEqual(
      new Set(['sanity']),
    )
  })
})

describe('hasFeature', () => {
  it('returns false for an undefined set', () => {
    expect(hasFeature(undefined, 'sanity')).toBe(false)
  })

  it('returns true when the feature is present', () => {
    expect(hasFeature(new Set<Feature>(['sanity']), 'sanity')).toBe(true)
  })
})

describe('isEnabledForRequest', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    delete process.env.SANITY_DISCUSSIONS_ENABLED
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('is false when the env var is off and the header is absent', () => {
    expect(
      isEnabledForRequest('SANITY_DISCUSSIONS_ENABLED', 'sanity', undefined),
    ).toBe(false)
  })

  it('is true when the env var is off but the header enables the feature', () => {
    expect(
      isEnabledForRequest(
        'SANITY_DISCUSSIONS_ENABLED',
        'sanity',
        new Set(['sanity']),
      ),
    ).toBe(true)
  })

  it('is true when the env var is on, regardless of the header', () => {
    process.env.SANITY_DISCUSSIONS_ENABLED = 'true'
    expect(
      isEnabledForRequest('SANITY_DISCUSSIONS_ENABLED', 'sanity', undefined),
    ).toBe(true)
    expect(
      isEnabledForRequest(
        'SANITY_DISCUSSIONS_ENABLED',
        'sanity',
        new Set(['sanity']),
      ),
    ).toBe(true)
  })

  it('does not enable the feature for a different, unrelated feature token', () => {
    expect(
      isEnabledForRequest(
        'SANITY_DISCUSSIONS_ENABLED',
        'sanity',
        new Set<Feature>([]),
      ),
    ).toBe(false)
  })
})
