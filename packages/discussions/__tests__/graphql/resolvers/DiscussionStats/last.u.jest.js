jest.mock('../../../../lib/stats/last')

const UUT = require('../../../../graphql/resolvers/DiscussionsStats/last')

describe('DiscussionStats.last', () => {
  const { createCache } = require('../../../../lib/stats/last')

  const defaultObj = null
  const defaultArgs = { }
  const defaultContext = Symbol('context')

  it('throws error if unable to retreive pre-populated data', async () => {
    expect.assertions(1)

    const getMock = jest.fn().mockReturnValue(null)
    createCache.mockImplementation(() => ({ get: getMock }))

    return expect(UUT(defaultObj, defaultArgs, defaultContext))
      .rejects
      .toThrowError('Unable to retrieve pre-populated data for DiscussionsStats.last')
  })

  it('returns pre-populated data', async () => {
    const expectedResult = {
      result: {
        discussions: Symbol('foobar')
      },
      updatedAt: Symbol('updatedAt'),
      key: Symbol('key')
    }

    const getMock = jest.fn().mockReturnValue(expectedResult)
    createCache.mockImplementation(() => ({ get: getMock }))

    const result = await UUT(defaultObj, defaultArgs, defaultContext)

    expect(createCache).toHaveBeenCalledWith(defaultContext)
    expect(getMock).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({
      updatedAt: expectedResult.updatedAt,
      key: expectedResult.key,
      ...expectedResult.result
    })
  })
})
