require('@orbiting/backend-modules-env').config('apps/api/.env.test.local')
const { Wait, DockerComposeEnvironment } = require('testcontainers')
const { createDB } = require('@orbiting/backend-modules-migrations')
const {
  migrateUp,
  seedSampleData,
} = require('@orbiting/backend-modules-migrations/lib')
const path = require('node:path')

describe('api boot tests', () => {
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

  afterAll(async () => {
    await server.close()
    composeEnv.down()
  })
})
