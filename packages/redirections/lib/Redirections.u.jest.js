const Redirections = require('./Redirections')

const pinnedDate = new Date('2019-06-01')

const mockPgdbInstance = ({
  find = jest.fn(),
  update = jest.fn(),
  updateAndGetOne = jest.fn(),
  count = jest.fn(),
  insertAndGet = jest.fn()
} = {}) => ({
  public: {
    redirections: {
      find,
      update,
      updateAndGetOne,
      count,
      insertAndGet
    }
  }
})

describe('update()', () => {
  beforeAll(() => {
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

    const countMock = jest.fn()
    const updateMock = jest.fn()
    const pgdb = mockPgdbInstance({ count: countMock, update: updateMock })

    await expect(update({ id: null }, pgdb)).rejects.toThrow(/Redirection does not exist/)
    expect(countMock).toHaveBeenCalledTimes(1)
    expect(updateMock).not.toHaveBeenCalled()
  })

  test('throw Error if source taken already', async () => {
    const { update } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(1)
    const updateMock = jest.fn()
    const pgdb = mockPgdbInstance({ count: countMock, update: updateMock })

    await expect(update({ id: '123-123-123', source: '/foobar', target: '/route/to/perdition' }, pgdb))
      .rejects.toThrow(/Another Redirection with source/)

    expect(countMock).toHaveBeenCalledTimes(2)
    expect(countMock)
      .toHaveBeenNthCalledWith(1, { deletedAt: null, id: '123-123-123' })
    expect(countMock)
      .toHaveBeenNthCalledWith(2, { deletedAt: null, 'id !=': '123-123-123', source: '/foobar' })

    expect(updateMock).not.toHaveBeenCalled()
  })

  test('w/ new target', async () => {
    const { update } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
    const updateMock = jest.fn()
    const pgdb = mockPgdbInstance({ count: countMock, updateAndGetOne: updateMock })

    const expectedConditions = { deletedAt: null, id: '123-123-123' }
    const expectedDefaultValues = {
      status: 302,
      keepQuery: false,
      resource: null,
      updatedAt: pinnedDate
    }

    const expectedProps = { id: '123-123-123', target: '/route/to/perdition' }

    await update(expectedProps, pgdb)

    expect(updateMock).toHaveBeenCalledWith(
      expectedConditions,
      {
        ...expectedProps,
        ...expectedDefaultValues
      }
    )
  })

  test('w/ new target, status, keepQuery and resource', async () => {
    const { update } = Redirections

    const countMock = jest.fn()
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
    const updateMock = jest.fn()
    const pgdb = mockPgdbInstance({ count: countMock, updateAndGetOne: updateMock })

    const expectedProps = {
      id: '123-123-123',
      target: '/route/to/perdition',
      status: 301,
      keepQuery: true,
      resource: { foo: 'bar' }
    }

    await update(expectedProps, pgdb)

    expect(updateMock).toHaveBeenCalledWith(
      { deletedAt: null, id: '123-123-123' },
      {
        ...expectedProps,
        updatedAt: pinnedDate
      }
    )
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

    const countMock = jest.fn()
    const updateMock = jest.fn()
    const pgdb = mockPgdbInstance({ count: countMock, update: updateMock })

    await expect(deleteById({ id: null }, pgdb)).rejects.toThrow(/Redirection does not exist/)
    expect(updateMock).not.toHaveBeenCalled()
  })

  test('id 123-123-123', async () => {
    const { deleteById } = Redirections

    const countMock = jest.fn().mockReturnValue(1)
    const updateMock = jest.fn()
    const pgdb = mockPgdbInstance({ count: countMock, update: updateMock })

    const expectedConditions = { deletedAt: null, id: '123-123-123' }

    await deleteById({ id: '123-123-123' }, pgdb)

    expect(countMock).toHaveBeenCalledWith(expectedConditions)
    expect(updateMock).toHaveBeenCalledWith(expectedConditions, { deletedAt: pinnedDate })
  })
})

describe('findAll()', () => {
  test('is a function', () => {
    const { findAll } = Redirections
    expect(typeof findAll).toBe('function')
  })

  test('w/o arguments', async () => {
    const { findAll } = Redirections

    const findMock = jest.fn()
    const pgdb = mockPgdbInstance({ find: findMock })

    await findAll(undefined, undefined, pgdb)
    expect(findMock).toHaveBeenCalledWith(
      { deletedAt: null },
      { orderBy: { createdAt: 'desc' } }
    )
  })

  test('limit 25', async () => {
    const { findAll } = Redirections

    const findMock = jest.fn()
    const pgdb = mockPgdbInstance({ find: findMock })

    await findAll(25, undefined, pgdb)

    expect(findMock).toHaveBeenCalledWith(
      { deletedAt: null },
      {
        limit: 25,
        orderBy: { createdAt: 'desc' }
      }
    )
  })

  test('limit 25 and offset 75', async () => {
    const { findAll } = Redirections

    const findMock = jest.fn()
    const pgdb = mockPgdbInstance({ find: findMock })

    await findAll(25, 75, pgdb)

    expect(findMock).toHaveBeenCalledWith(
      { deletedAt: null },
      {
        limit: 25,
        offset: 75,
        orderBy: { createdAt: 'desc' }
      }
    )
  })
})

describe('isValidSource()', () => {
  test('is a function', () => {
    const { isValidSource } = Redirections
    expect(typeof isValidSource).toBe('function')
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
