const consents = require('../lib/Consents')
const { Instance } = require('@orbiting/backend-modules-test')

beforeAll(async () => {
  await Instance.init({ serverName: 'republik' })
}, 60000)

afterAll(async () => {
  await global.instance.closeAndCleanup()
}, 60000)

beforeEach(async () => {
  const { pgdb } = global.instance.context
  await pgdb.public.users.truncate({ cascade: true })
  await pgdb.public.sessions.truncate({ cascade: true })
  global.instance.apolloFetch = global.instance.createApolloFetch()
})

// const pgDatabase = () => global.instance.context.pgdb

test('allowed consents length', () => {
  expect(consents.VALID_POLICIES).toHaveLength(5)
})
