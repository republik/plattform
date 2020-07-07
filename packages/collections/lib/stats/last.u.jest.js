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

      const options = {
        ...expectedDefaultOptions
      }

      expect(cache.create).toHaveBeenCalledWith(options, expectedContext)
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
  const context = { pgdb: { query: jest.fn().mockResolvedValue([]) } }

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

      expect(arg1.result).toBeInstanceOf(Array)
      expect(arg1.updatedAt).toBeInstanceOf(Date)
    })
  })

  it('returns result using callback', async () => {
    const callbackMock = jest.fn()

    await UUT(context, callbackMock)

    expect(callbackMock).toHaveBeenCalledTimes(1)

    const [call1] = callbackMock.mock.calls
    const [arg1] = call1

    expect(arg1).toBeInstanceOf(Array)
    expect(LAST_INTERVALS).toHaveLength(LAST_INTERVALS.length)

    expect(cache.create).not.toHaveBeenCalled()
  })
})
