const generateScopedSearchKeyMock = jest.fn().mockReturnValue('scoped-key')

jest.mock('../client', () => ({
  getClient: () => ({
    keys: () => ({ generateScopedSearchKey: generateScopedSearchKeyMock }),
  }),
}))

import { generateScopedSearchKey } from '../scopedKey'

const lastParams = () =>
  generateScopedSearchKeyMock.mock.calls[
    generateScopedSearchKeyMock.mock.calls.length - 1
  ][1]

const lastParentKey = () =>
  generateScopedSearchKeyMock.mock.calls[
    generateScopedSearchKeyMock.mock.calls.length - 1
  ][0]

describe('generateScopedSearchKey', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv, TYPESENSE_SEARCH_KEY: 'parent-key' }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  // The whole point of the change away from searchScope: what a caller may
  // search is decided by the parent key's collection list, never by a filter
  // embedded in the scoped key.
  it.each(['public', 'member', 'admin'] as const)(
    'embeds no filter_by for the %s tier',
    (tier) => {
      generateScopedSearchKey(tier)

      expect(lastParams()).not.toHaveProperty('filter_by')
      expect(Object.keys(lastParams())).toEqual(['expires_at'])
    },
  )

  it.each(['public', 'member', 'admin'] as const)(
    'derives the %s tier from TYPESENSE_SEARCH_KEY today',
    (tier) => {
      generateScopedSearchKey(tier)

      expect(lastParentKey()).toBe('parent-key')
    },
  )

  it('returns the minted key with a five minute expiry', () => {
    const before = Date.now()
    const { key, expiresAt } = generateScopedSearchKey('public')

    expect(key).toBe('scoped-key')
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + 5 * 60 * 1000)
    expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + 5 * 60 * 1000)
    expect(lastParams().expires_at).toBe(Math.floor(expiresAt.getTime() / 1000))
  })

  it('names the missing env var when the parent key is unset', () => {
    delete process.env.TYPESENSE_SEARCH_KEY

    expect(() => generateScopedSearchKey('admin')).toThrow(
      /TYPESENSE_SEARCH_KEY is not set/,
    )
  })
})
