require('@orbiting/backend-modules-env').config('apps/api/.env.test.local')
const { Wait, DockerComposeEnvironment } = require('testcontainers')
const {
  createDB,
  migrateUp,
  seedSampleData,
} = require('@orbiting/backend-modules-migrations')
const { PgDb } = require('pogi')
const { gql, ApolloClient, InMemoryCache } = require('@apollo/client')
const path = require('node:path')

describe('some example tests', () => {
  let composeEnv = null
  let server = null

  beforeAll(async () => {
    composeEnv = await new DockerComposeEnvironment(
      path.resolve(__dirname, '../../..'),
      ['docker-compose-test.yml'],
    )
      .withWaitStrategy(
        'redis',
        Wait.forLogMessage('Ready to accept connections'),
      )
      .withWaitStrategy('postgres', Wait.forHealthCheck())
      .up(['postgres', 'redis', 'elastic'])

    await createDB(process.env.DATABASE_URL)

    await migrateUp()

    await seedSampleData(process.env.DATABASE_URL)

    server = await require('../server').start()
  }, 120000)

  test('api is responding', async () => {
    const res = await fetch('http://localhost:5010/graphiql')

    await expect(res.status).toBe(200)
  })

  test('api is returning graphql query results', async () => {
    const client = new ApolloClient({
      uri: 'http://localhost:5010/graphql',
      cache: new InMemoryCache(),
      headers: {
        cookie: '',
        accept: '',
        Authorization: '',
      },
    })
    const results = await client.query({
      query: gql`
        {
          crowdfundings {
            name
          }
        }
      `,
    })
    expect(results.data.crowdfundings).toHaveLength(5)
  })

  test('DB query returns some users', async () => {
    const pgdb = await PgDb.connect({
      application_name: 'test',
      connectionString: process.env.DATABASE_URL,
    })
    const result = await pgdb.query('SELECT * FROM users LIMIT 5')
    expect(result).toHaveLength(5)
    await pgdb.close()
  })

  afterAll(async () => {
    await server.close()
    composeEnv.down()
  })
})
