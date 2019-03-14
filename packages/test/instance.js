const path = require('path')
const DB = require('./db')

module.exports = async ({ serverName, testName }) => {
  const relativeServerPath = `../../servers/${serverName}/`

  require('@orbiting/backend-modules-env').config(
    path.join(__dirname, relativeServerPath, '.env')
  )

  let pgdb
  let port = Math.floor(Math.random() * 40000) + 20000
  console.log({port})

  try {
    pgdb = await DB.createMigrateConnect(testName)
  } catch(e) {
    await pgdb && pgdb.close()
    await DB.drop(testName)
  }

  const Server = require(`${relativeServerPath}server`)
  const server = await Server.start({
    pgdb,
    port
  })

  const closeAndCleanup = async () => {
    await Server.close()
    if (pgdb) {
      await pgdb.close()
    }
    await DB.drop(testName)
  }

  return {
    server,
    pgdb,
    closeAndCleanup
  }

}
