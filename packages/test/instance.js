const path = require('path')
const DB = require('./db')
const buildCreateApolloFetch = require('./buildCreateApolloFetch')

module.exports = async ({ serverName, testName }) => {
  const relativeServerPath = `../../servers/${serverName}/`

  // load env of server
  require('@orbiting/backend-modules-env').config(
    path.join(__dirname, relativeServerPath, '.env')
  )

  // create DB
  let databaseUrl
  try {
    databaseUrl = await DB.createMigrateGetUrl(testName)
  } catch (e) {
    await DB.drop(testName)
    throw new Error('aboting instance creation, db could not be created')
  }

  const port = Math.floor(Math.random() * 40000) + 20000

  const redisUrl = `${process.env.REDIS_URL || 'redis://127.0.0.1:6379'}/9`

  process.env.PORT = port
  process.env.DATABASE_URL = databaseUrl
  process.env.REDIS_URL = redisUrl

  // require server's server.js
  const Server = require(`${relativeServerPath}server`)
  const server = await Server.start()

  const context = server.createGraphqlContext({})

  const closeAndCleanup = async () => {
    await server.close()
    await DB.drop(testName)
  }

  return {
    server,
    closeAndCleanup,
    apolloFetch: buildCreateApolloFetch(port)(),
    context
  }
}
