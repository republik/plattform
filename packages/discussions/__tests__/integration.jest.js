const Instance = require('@orbiting/backend-modules-test/instance')
const {
  setGlobals,
  getGlobal
} = require('@orbiting/backend-modules-test/globals')

const testName = 'discussions'

describe('discussions', () => {
  beforeAll( async () => {
    const instance = await Instance({
      serverName: 'republik',
      testName
    })
    setGlobals(testName, { instance })
  }, 60000)

  afterAll( async () => {
    await getGlobal(testName, 'instance').closeAndCleanup()
  }, 30000)

  test('test', async () => {
    const instance = getGlobal(testName, 'instance')
    /*
    await new Promise( resolve => {
      setTimeout( ()=> resolve(), 40000)
    })
    */
    expect(await instance.pgdb.public.users.count()).toEqual(0)

  }, 60000)

})
