const Instance = require('@orbiting/backend-modules-test/instance')

const testName = 'discussions'

describe('discussions', () => {
  beforeAll(async () => {
    const instance = await Instance({
      serverName: 'republik',
      testName
    })
    global.instance = instance
  }, 60000)

  afterAll(async () => {
    global.instance.closeAndCleanup()
  }, 30000)

  test('test', async () => {
    const { instance } = global
    expect(await instance.pgdb.public.users.count()).toEqual(0)
  }, 60000)
})
