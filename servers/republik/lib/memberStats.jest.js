const PgDbMock = require('@orbiting/backend-modules-base/lib/pgdb')

const UUT = require('./memberStats')

describe('memberStats', () => {
  test('count()', async done => {
    process.env.PARKING_USER_ID = '123'

    const expectedResult = Symbol('result')

    const pgdb = await PgDbMock.connect()
    pgdb.queryOneField.mockReturnValue(expectedResult)

    const result = await UUT.count({ pgdb })

    expect(pgdb.queryOneField).toHaveBeenCalledTimes(1)
    expect(pgdb.queryOneField.mock.calls[0]).toEqual(
      expect.arrayContaining([{ excludeUserId: process.env.PARKING_USER_ID }])
    )
    expect(result).toEqual(expectedResult)

    done()
  })
})
