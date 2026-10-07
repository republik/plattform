const mediaProgressByIds = require('../../../graphql/resolvers/_queries/mediaProgressByIds')
const Collection = require('../../../lib/Collection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

jest.mock('../../../lib/Collection', () => ({
  getMediaProgressItem: jest.fn(),
}))
jest.mock('../../../lib/ProgressOptOut', () => ({
  COLLECTION_NAME: 'progress',
  status: jest.fn(),
}))

const context = (user = { id: 'user-1' }) => ({ user, t: (k) => k })

describe('mediaProgressByIds', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ProgressOptOut.status.mockResolvedValue(false)
  })

  it('returns one entry per id in input order, null where missing', async () => {
    Collection.getMediaProgressItem.mockImplementation(async ({ mediaId }) =>
      mediaId === 'b' ? { id: 'p-b', secs: 42 } : undefined,
    )
    const result = await mediaProgressByIds(
      null,
      { mediaIds: ['a', 'b', 'c'] },
      context(),
    )
    expect(result).toEqual([null, { id: 'p-b', secs: 42 }, null])
  })

  it('returns nulls without querying when signed out', async () => {
    const result = await mediaProgressByIds(
      null,
      { mediaIds: ['a', 'b'] },
      context(null),
    )
    expect(result).toEqual([null, null])
    expect(Collection.getMediaProgressItem).not.toHaveBeenCalled()
  })

  it('returns nulls when the user opted out of progress', async () => {
    ProgressOptOut.status.mockResolvedValue(true)
    const result = await mediaProgressByIds(
      null,
      { mediaIds: ['a'] },
      context(),
    )
    expect(result).toEqual([null])
    expect(Collection.getMediaProgressItem).not.toHaveBeenCalled()
  })

  it('answers ids past the 100 cap with null instead of throwing', async () => {
    Collection.getMediaProgressItem.mockResolvedValue({ id: 'p', secs: 1 })
    const mediaIds = Array.from({ length: 101 }, (_, i) => String(i))
    const result = await mediaProgressByIds(null, { mediaIds }, context())
    expect(result).toHaveLength(101)
    expect(result[99]).toEqual({ id: 'p', secs: 1 })
    expect(result[100]).toBeNull()
    expect(Collection.getMediaProgressItem).toHaveBeenCalledTimes(100)
  })
})
