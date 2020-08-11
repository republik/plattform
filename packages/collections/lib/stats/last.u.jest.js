jest.mock('@orbiting/backend-modules-utils')

describe('const LAST_INTERVALS', () => {
  const { LAST_INTERVALS: UUT } = require('./last')

  it('is an array', () => {
    expect(UUT).toBeInstanceOf(Array)
  })

  it('has at least 1 item', () => {
    expect(UUT.length).toBeGreaterThanOrEqual(1)
  })

  it('has objects w/ key and interval prop', () => {
    UUT.map(o => {
      expect(o).toHaveProperty('key')
      expect(o).toHaveProperty('interval')
    })
  })
})

describe('createCache()', () => {
  const { createCache: UUT } = require('./last')

  const { cache } = require('@orbiting/backend-modules-utils')

  const expectedDefaultOptions = {
    namespace: 'collections',
    prefix: 'stats:last',
    ttl: 60 * 60 * 24,
    key: 'any'
  }

  describe('wrap create.cache() in @orbiting/backend-modules-utils', () => {
    it('calls it with options and context arguments', () => {
      const expectedContext = Symbol('context')

      UUT(null, expectedContext)

      expect(cache.create).toHaveBeenCalledWith(expectedDefaultOptions, expectedContext)
    })

    it('calls it with merged options and context arguments', () => {
      const expectedOption = Symbol('an additional option')
      const expectedKey = Symbol('key prop, expected to replace default')
      const expectedContext = Symbol('context')

      UUT({ expectedOption, key: expectedKey }, expectedContext)

      const options = {
        ...expectedDefaultOptions,
        key: expectedKey,
        expectedOption
      }

      expect(cache.create).toHaveBeenCalledWith(options, expectedContext)
    })
  })
})

describe('populate()', () => {
  const { LAST_INTERVALS, populate: UUT } = require('./last')

  const { cache } = require('@orbiting/backend-modules-utils')

  const expectedResult = [
    { key: Symbol('collection1') },
    { key: Symbol('collection2') }
  ]
  const queryMock = jest.fn().mockResolvedValue(expectedResult)
  const context = { pgdb: { query: queryMock } }

  beforeEach(() => {
    cache.create.mockImplementation(() => ({ set: jest.fn() }))
  })

  it('caches result', async () => {
    const setMock = jest.fn()
    cache.create.mockImplementation(() => ({ set: setMock }))

    await UUT(context)

    expect(setMock).toHaveBeenCalledTimes(LAST_INTERVALS.length)

    setMock.mock.calls.map(call => {
      const [arg1] = call

      expect(arg1.result).toEqual(expectedResult)
      expect(arg1.updatedAt).toBeInstanceOf(Date)
    })
  })

  it('respects dry mode', async () => {
    const result = await UUT(context, true)

    expect(result).toBeInstanceOf(Array)

    expect(cache.create).not.toHaveBeenCalled()
  })
})
