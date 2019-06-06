const Redirections = require('./Redirections')

const pinnedDate = new Date('2019-06-01')

const mockPgdbInstance = ({
  find = jest.fn(),
  update = jest.fn(),
  updateAndGetOne = jest.fn(),
  count = jest.fn(),
  insertAndGet = jest.fn(),
  commit = jest.fn(),
  rollback = jest.fn()
} = {}) => {
  const pgdb = {
    public: {
      redirections: {
        find,
        update,
        updateAndGetOne,
        count,
        insertAndGet
      }
    },
    transactionCommit: commit,
    transactionRollback: rollback
  }

  return {
    ...pgdb,
    transactionBegin: () => pgdb
  }
}

describe('add()', () => {
  beforeEach(() => {
    process.env.FRONTEND_BASE_URL = 'http://localhost'
    global.Date = class extends Date {
      constructor () {
        return pinnedDate
      }
    }
  })

  test('is a function', () => {
    const { add } = Redirections
    expect(typeof add).toBe('function')
  })

  test('throw Error if source is missing', async () => {
    const { add } = Redirections

    const insertMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      insertAndGet: insertMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(add({ target: '/route/to/predition' }, pgdb))
      .rejects.toThrow(/source .* invalid/)

    expect(insertMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('throw Error if target is missing', async () => {
    const { add } = Redirections

    const insertMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      insertAndGet: insertMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(add({ source: '/foobar' }, pgdb))
      .rejects.toThrow(/target .* invalid/)

    expect(insertMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('throw Error if status is invalid', async () => {
    const { add } = Redirections

    const insertMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      insertAndGet: insertMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(add({ source: '/foobar', target: '/route/to/predition', status: 123 }, pgdb))
      .rejects.toThrow(/status .* invalid/)

    expect(insertMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('throw Error if source already exists', async () => {
    const { add } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
    const insertMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      insertAndGet: insertMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(add({ source: '/foobar', target: '/route/to/predition' }, pgdb))
      .rejects.toThrow(/Redirection exists already/)

    expect(countMock)
      .toHaveBeenCalledWith({ deletedAt: null, source: '/foobar' })
    expect(insertMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('w/ source and target', async () => {
    const { add } = Redirections

    const countMock = jest.fn()
    const insertMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      insertAndGet: insertMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    const expectedDefaultValues = {
      status: 302,
      keepQuery: false,
      resource: null,
      createdAt: pinnedDate,
      updatedAt: pinnedDate
    }

    const expectedProps = {
      source: '/foobar',
      target: '/route/to/predition'
    }

    await add(expectedProps, pgdb)

    expect(countMock)
      .toHaveBeenCalledWith({ deletedAt: null, source: '/foobar' })
    expect(insertMock)
      .toHaveBeenCalledWith({ ...expectedDefaultValues, ...expectedProps })
    expect(commitMock).toHaveBeenCalledTimes(1)
    expect(rollbackMock).not.toHaveBeenCalled()
  })

  test('w/ source, target, status and keepQuery', async () => {
    const { add } = Redirections

    const countMock = jest.fn()
    const insertMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      insertAndGet: insertMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    const expectedDefaultValues = {
      resource: null,
      createdAt: pinnedDate,
      updatedAt: pinnedDate
    }

    const expectedProps = {
      source: '/foobar',
      target: '/route/to/predition',
      keepQuery: true,
      status: 301
    }

    await add(expectedProps, pgdb)

    expect(countMock)
      .toHaveBeenCalledWith({ deletedAt: null, source: '/foobar' })
    expect(insertMock)
      .toHaveBeenCalledWith({ ...expectedDefaultValues, ...expectedProps })
    expect(commitMock).toHaveBeenCalledTimes(1)
    expect(rollbackMock).not.toHaveBeenCalled()
  })

  test('w/ external target', async () => {
    const { add } = Redirections

    const countMock = jest.fn()
    const insertMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      insertAndGet: insertMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    const expectedDefaultValues = {
      status: 302,
      keepQuery: false,
      resource: null,
      createdAt: pinnedDate,
      updatedAt: pinnedDate
    }

    const expectedProps = {
      source: '/foobar',
      target: 'https://de.wikipedia.org/wiki/Claus_Kleber'
    }

    await add(expectedProps, pgdb)

    expect(countMock)
      .toHaveBeenCalledWith({ deletedAt: null, source: '/foobar' })
    expect(insertMock)
      .toHaveBeenCalledWith({ ...expectedDefaultValues, ...expectedProps })
    expect(commitMock).toHaveBeenCalledTimes(1)
    expect(rollbackMock).not.toHaveBeenCalled()
  })
})

describe('update()', () => {
  beforeEach(() => {
    process.env.FRONTEND_BASE_URL = 'http://localhost'
    global.Date = class extends Date {
      constructor () {
        return pinnedDate
      }
    }
  })

  test('is a function', () => {
    const { update } = Redirections
    expect(typeof update).toBe('function')
  })

  test('throw Error if id null', async () => {
    const { update } = Redirections

    const updateAndGetOneMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      updateAndGetOne: updateAndGetOneMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(update({ id: null }, pgdb)).rejects.toThrow(/Redirection does not exist/)

    expect(updateAndGetOneMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('throw Error if source taken already', async () => {
    const { update } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(1)
    const updateAndGetOneMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      updateAndGetOne: updateAndGetOneMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(update({ id: '123-123-123', source: '/foobar', target: '/route/to/perdition' }, pgdb))
      .rejects.toThrow(/Another Redirection with source/)

    expect(countMock).toHaveBeenCalledTimes(2)
    expect(countMock)
      .toHaveBeenNthCalledWith(1, { deletedAt: null, id: '123-123-123' })
    expect(countMock)
      .toHaveBeenNthCalledWith(2, { deletedAt: null, 'id !=': '123-123-123', source: '/foobar' })
    expect(updateAndGetOneMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('throw Error if source is not a valid path', async () => {
    const { update } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(1)
    const updateAndGetOneMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      updateAndGetOne: updateAndGetOneMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(update({ id: '123-123-123', source: '/foobar?schnarz=bar', target: '/route/to/perdition' }, pgdb))
      .rejects.toThrow(/source .* invalid/)

    expect(countMock).toHaveBeenCalledTimes(1)
    expect(countMock)
      .toHaveBeenNthCalledWith(1, { deletedAt: null, id: '123-123-123' })
    expect(updateAndGetOneMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('throw Error if target is not a valid URL nor path', async () => {
    const { update } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
    const updateAndGetOneMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      updateAndGetOne: updateAndGetOneMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(update({ id: '123-123-123', source: '/foobar', target: 'faulty/target/route' }, pgdb))
      .rejects.toThrow(/target .* invalid/)

    expect(countMock).toHaveBeenCalledTimes(2)
    expect(countMock)
      .toHaveBeenNthCalledWith(1, { deletedAt: null, id: '123-123-123' })
    expect(updateAndGetOneMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('w/ new target', async () => {
    const { update } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
    const updateAndGetOneMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      updateAndGetOne: updateAndGetOneMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    const expectedConditions = { deletedAt: null, id: '123-123-123' }
    const expectedDefaultValues = {
      status: 302,
      keepQuery: false,
      resource: null,
      updatedAt: pinnedDate
    }

    const expectedProps = { id: '123-123-123', target: '/route/to/perdition' }

    await update(expectedProps, pgdb)

    expect(updateAndGetOneMock).toHaveBeenCalledWith(
      expectedConditions,
      {
        ...expectedProps,
        ...expectedDefaultValues
      }
    )
    expect(commitMock).toHaveBeenCalledTimes(1)
    expect(rollbackMock).not.toHaveBeenCalled()
  })

  test('w/ new target, status, keepQuery and resource', async () => {
    const { update } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
    const updateAndGetOneMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      updateAndGetOne: updateAndGetOneMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    const expectedProps = {
      id: '123-123-123',
      target: '/route/to/perdition',
      status: 301,
      keepQuery: true,
      resource: { foo: 'bar' }
    }

    await update(expectedProps, pgdb)

    expect(updateAndGetOneMock).toHaveBeenCalledWith(
      { deletedAt: null, id: '123-123-123' },
      {
        ...expectedProps,
        updatedAt: pinnedDate
      }
    )
    expect(commitMock).toHaveBeenCalledTimes(1)
    expect(rollbackMock).not.toHaveBeenCalled()
  })
})

describe('deleteById()', () => {
  beforeAll(() => {
    global.Date = class extends Date {
      constructor () {
        return pinnedDate
      }
    }
  })

  test('is a function', () => {
    const { deleteById } = Redirections
    expect(typeof deleteById).toBe('function')
  })

  test('throw Error if id null', async () => {
    const { deleteById } = Redirections

    const updateMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      update: updateMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    await expect(deleteById({ id: null }, pgdb)).rejects.toThrow(/Redirection does not exist/)
    expect(updateMock).not.toHaveBeenCalled()
    expect(commitMock).not.toHaveBeenCalled()
    expect(rollbackMock).toHaveBeenCalledTimes(1)
  })

  test('id 123-123-123', async () => {
    const { deleteById } = Redirections

    const countMock = jest.fn().mockReturnValue(1)
    const updateMock = jest.fn()
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    const pgdb = mockPgdbInstance({
      count: countMock,
      update: updateMock,
      commit: commitMock,
      rollback: rollbackMock
    })

    const expectedConditions = { deletedAt: null, id: '123-123-123' }

    await deleteById({ id: '123-123-123' }, pgdb)

    expect(countMock).toHaveBeenCalledWith(expectedConditions)
    expect(updateMock).toHaveBeenCalledWith(expectedConditions, { deletedAt: pinnedDate })
    expect(commitMock).toHaveBeenCalledTimes(1)
    expect(rollbackMock).not.toHaveBeenCalled()
  })
})

describe('findAll()', () => {
  test('is a function', () => {
    const { findAll } = Redirections
    expect(typeof findAll).toBe('function')
  })

  test('execute', async () => {
    const { findAll } = Redirections

    const findMock = jest.fn()
    const pgdb = mockPgdbInstance({ find: findMock })

    await findAll(pgdb)
    expect(findMock).toHaveBeenCalledWith(
      { deletedAt: null },
      { orderBy: { createdAt: 'desc' } }
    )
  })
})

describe('validateSource()', () => {
  test('is a function', () => {
    const { validateSource } = Redirections
    expect(typeof validateSource).toBe('function')
  })

  test('throw Error if source is an invalid path', () => {
    const { validateSource } = Redirections
    const expectedErrorMessagee = /source .* invalid/

    expect(() => validateSource(null)).toThrow(expectedErrorMessagee)
    expect(() => validateSource(undefined)).toThrow(expectedErrorMessagee)
    expect(() => validateSource(false)).toThrow(expectedErrorMessagee)
    expect(() => validateSource({})).toThrow(expectedErrorMessagee)
    expect(() => validateSource(123)).toThrow(expectedErrorMessagee)

    expect(() => validateSource('foobar')).toThrow(expectedErrorMessagee)
    expect(() => validateSource('foobar/123')).toThrow(expectedErrorMessagee)
    expect(() => validateSource('+123456789')).toThrow(expectedErrorMessagee)

    expect(() => validateSource('/foobar/123?p=456')).toThrow(expectedErrorMessagee)
    expect(() => validateSource('/foobar/123?p=456#123')).toThrow(expectedErrorMessagee)

    expect(() => validateSource('/foobar/umläute%20and%20spaces')).toThrow(expectedErrorMessagee)

    expect(() => validateSource('https://de.wikipedia.org/')).toThrow(expectedErrorMessagee)
    expect(() => validateSource('https://de.wikipedia.org/wiki/Claus_Kleber')).toThrow(expectedErrorMessagee)
    expect(() => validateSource('https://de.wikipedia.org/wiki/Claus_Kleber?foo=bar')).toThrow(expectedErrorMessagee)
    expect(() => validateSource('https://de.wikipedia.org:8080/wiki/Claus_Kleber')).toThrow(expectedErrorMessagee)
  })

  test('w/ valid path', () => {
    const { validateSource } = Redirections

    expect(validateSource('/foobar')).toBeUndefined()
    expect(validateSource('/foobar/123')).toBeUndefined()

    expect(validateSource('/foobar/umläute')).toBeUndefined()
    expect(validateSource('/foobar/umläute und spaces')).toBeUndefined()
    expect(validateSource('/foobar/uml%C3%A4ute%20und%20spaces')).toBeUndefined()

    expect(validateSource('/~someprofile')).toBeUndefined()
    expect(validateSource('/2019/05/31/some-article')).toBeUndefined()
  })
})

describe('validateTarget()', () => {
  test('is a function', () => {
    const { validateTarget } = Redirections
    expect(typeof validateTarget).toBe('function')
  })

  test('throw Error if target is an invalid URL', () => {
    const { validateTarget } = Redirections
    const expectedErrorMessagee = /target .* invalid/

    expect(() => validateTarget(null)).toThrow(expectedErrorMessagee)
    expect(() => validateTarget(undefined)).toThrow(expectedErrorMessagee)
    expect(() => validateTarget(false)).toThrow(expectedErrorMessagee)
    expect(() => validateTarget({})).toThrow(expectedErrorMessagee)
    expect(() => validateTarget(123)).toThrow(expectedErrorMessagee)

    expect(() => validateTarget('foobar')).toThrow(expectedErrorMessagee)
    expect(() => validateTarget('foobar/123')).toThrow(expectedErrorMessagee)
    expect(() => validateTarget('+123456789')).toThrow(expectedErrorMessagee)

    expect(() => validateTarget('https://de.wikipedia.org')).toThrow(expectedErrorMessagee)
    expect(() => validateTarget('https:/de.wikipedia.org/')).toThrow(expectedErrorMessagee)
    expect(() => validateTarget('http:de.wikipedia.org/')).toThrow(expectedErrorMessagee)
    expect(() => validateTarget('http://röpüblique.ch/')).toThrow(expectedErrorMessagee)
  })

  test('w/ valid URL', () => {
    const { validateTarget } = Redirections

    expect(validateTarget('/foobar')).toBeUndefined()
    expect(validateTarget('/foobar/123')).toBeUndefined()
    expect(validateTarget('/foobar/123?p=456')).toBeUndefined()
    expect(validateTarget('/foobar/123?p=456#123')).toBeUndefined()

    expect(validateTarget('/foobar/umläute')).toBeUndefined()
    expect(validateTarget('/foobar/umläute und spaces')).toBeUndefined()
    expect(validateTarget('/foobar/uml%C3%A4ute%20und%20spaces')).toBeUndefined()

    expect(validateTarget('/~someprofile')).toBeUndefined()
    expect(validateTarget('/2019/05/31/some-article')).toBeUndefined()

    expect(validateTarget('https://de.wikipedia.org/')).toBeUndefined()
    expect(validateTarget('https://de.wikipedia.org/wiki/Claus_Kleber')).toBeUndefined()
    expect(validateTarget('https://de.wikipedia.org/wiki/Claus_Kleber?foo=bar')).toBeUndefined()
    expect(validateTarget('https://de.wikipedia.org:8080/wiki/Claus_Kleber')).toBeUndefined()
    expect(validateTarget('http://xn--rpblique-n4a5d.ch/')).toBeUndefined()
  })
})

describe('validateStatus()', () => {
  test('is a function', () => {
    const { validateStatus } = Redirections
    expect(typeof validateStatus).toBe('function')
  })

  test('throw Error if status is neither 301 or 302', () => {
    const { validateStatus } = Redirections
    const expectedErrorMessagee = /status .* invalid/

    expect(() => validateStatus(123)).toThrow(expectedErrorMessagee)
    expect(() => validateStatus('123')).toThrow(expectedErrorMessagee)
    expect(() => validateStatus('abc')).toThrow(expectedErrorMessagee)
    expect(() => validateStatus(null)).toThrow(expectedErrorMessagee)
    expect(() => validateStatus(undefined)).toThrow(expectedErrorMessagee)
    expect(() => validateStatus(false)).toThrow(expectedErrorMessagee)
    expect(() => validateStatus({})).toThrow(expectedErrorMessagee)
    expect(() => validateStatus('301')).toThrow(expectedErrorMessagee)
    expect(() => validateStatus('302')).toThrow(expectedErrorMessagee)
  })

  test('w/ status 301 or 302', () => {
    const { validateStatus } = Redirections

    expect(validateStatus(301)).toBeUndefined()
    expect(validateStatus(302)).toBeUndefined()
  })
})

describe('DEFAULT_ROLES', () => {
  test('DEFAULT_ROLES contains "admin", "editor"', () => {
    const expected = ['admin', 'editor']
    const { DEFAULT_ROLES } = Redirections
    expect(DEFAULT_ROLES).toEqual(expect.arrayContaining(expected))
    expect(DEFAULT_ROLES).toHaveLength(2)
  })
})
