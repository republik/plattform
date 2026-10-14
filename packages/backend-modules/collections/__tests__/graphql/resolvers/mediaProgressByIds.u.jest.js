const mediaProgressByIds = require('../../../graphql/resolvers/_queries/mediaProgressByIds')
const Collection = require('../../../lib/Collection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

jest.mock('../../../lib/Collection', () => ({
  byNameForUser: jest.fn(),
  findMediaItemsByIds: jest.fn(),
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
    Collection.byNameForUser.mockResolvedValue({ id: 'collection-1' })
  })

  it('returns one entry per id in input order, null where missing', async () => {
    Collection.findMediaItemsByIds.mockResolvedValue([
      null,
      { id: 'p-b', secs: 42 },
      null,
    ])
    const result = await mediaProgressByIds(
      null,
      { mediaIds: ['a', 'b', 'c'] },
      context(),
    )
    expect(result).toEqual([null, { id: 'p-b', secs: 42 }, null])
    expect(Collection.findMediaItemsByIds).toHaveBeenCalledWith(
      {
        collectionId: 'collection-1',
        userId: 'user-1',
        mediaIds: ['a', 'b', 'c'],
      },
      expect.anything(),
    )
  })

  it('returns nulls without querying when signed out', async () => {
    const result = await mediaProgressByIds(
      null,
      { mediaIds: ['a', 'b'] },
      context(null),
    )
    expect(result).toEqual([null, null])
    expect(Collection.findMediaItemsByIds).not.toHaveBeenCalled()
  })

  it('returns nulls when the user opted out of progress', async () => {
    ProgressOptOut.status.mockResolvedValue(true)
    const result = await mediaProgressByIds(
      null,
      { mediaIds: ['a'] },
      context(),
    )
    expect(result).toEqual([null])
    expect(Collection.findMediaItemsByIds).not.toHaveBeenCalled()
  })

  it('answers ids past the 100 cap with null instead of throwing', async () => {
    Collection.findMediaItemsByIds.mockImplementation(async ({ mediaIds }) =>
      mediaIds.map(() => ({ id: 'p', secs: 1 })),
    )
    const mediaIds = Array.from({ length: 101 }, (_, i) => String(i))
    const result = await mediaProgressByIds(null, { mediaIds }, context())
    expect(result).toHaveLength(101)
    expect(result[99]).toEqual({ id: 'p', secs: 1 })
    expect(result[100]).toBeNull()
    expect(
      Collection.findMediaItemsByIds.mock.calls[0][0].mediaIds,
    ).toHaveLength(100)
  })

  it('returns nulls when the progress collection is missing', async () => {
    Collection.byNameForUser.mockResolvedValue(null)
    const result = await mediaProgressByIds(
      null,
      { mediaIds: ['a'] },
      context(),
    )
    expect(result).toEqual([null])
  })
})
