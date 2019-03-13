const DB = require('@orbiting/backend-modules-base/lib/db')

describe('discussions', () => {

  beforeAll( async () => {
    const name = 'test_discussions'
    let pgdb
    try {
      pgdb = await DB.createMigrateConnect(name)
    } catch(e) {
      await pgdb && pgdb.close()
      await DB.drop(name)
    }
    global.pgdb = pgdb
    global.dbName = name
  }, 60000)

  afterAll( async () => {
    global.pgdb && await global.pgdb.close()
    global.dbName && await DB.drop(global.dbName)
  }, 60000)

  test('test', async () => {
    expect(await global.pgdb.public.users.count()).toEqual(0)

  })

})
