jest.mock('../../../../lib/stats/last')

const UUT = require('../../../../graphql/resolvers/CollectionsStats/last')

describe('CollectionsStats.last', () => {
  const { createCache } = require('../../../../lib/stats/last')

  const defaultObj = null
  const defaultArgs = {
    name: Symbol('collection name'),
  }

  it('throws error if unable to retreive pre-populated data', async () => {
    expect.assertions(1)

    // Loader shall find some random collection ID
    const loadMock = jest.fn(() => ({ id: Symbol('some collection id') }))
    const context = {
      loaders: {
        Collection: {
          byKeyObj: {
            load: loadMock
          }
        }
      }
    }

    // Hinder cache util to get any data
    const getMock = jest.fn().mockReturnValue(null)
    createCache.mockImplementation(() => ({ get: getMock }))

    return expect(UUT(defaultObj, defaultArgs, context))
      .rejects
      .toThrowError('Unable to retrieve pre-populated data for Collection.CollectionsStats.last')
  })

  it('throws error if collection name cannot be found', async () => {
    expect.assertions(1)

    // Hinder loader to find any data
    const loadMock = jest.fn().mockImplementation(null)
    const context = {
      loaders: {
        Collection: {
          byKeyObj: {
            load: loadMock
          }
        }
      }
    }

    return expect(UUT(defaultObj, { name: 'foobar' }, context))
      .rejects
      .toThrowError('Collection "foobar" not found')
  })

  it('returns pre-populated data', async () => {
    const expectedCollectionId = Symbol('collection id')
    const expectedResult = {
      collectionId: expectedCollectionId,
      updatedAt: Symbol('updatedAt')
    }

    const loadMock = jest.fn().mockImplementation(() => ({ id: expectedCollectionId }))
    const context = {
      loaders: {
        Collection: {
          byKeyObj: {
            load: loadMock
          }
        }
      }
    }

    const prepopulatedData = {
      result: [
        expectedResult,
        { collectionId: Symbol('some other collection') }
      ],
      updatedAt: expectedResult.updatedAt
    }

    const getMock = jest.fn().mockReturnValue(prepopulatedData)
    createCache.mockImplementation(() => ({ get: getMock }))

    const result = await UUT(defaultObj, defaultArgs, context)

    expect(createCache).toHaveBeenCalledWith(context)
    expect(getMock).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject(expectedResult)
  })
})
