const log = require('why-is-node-running')
const path = require('path')
/*
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const pgdb = await PgDb.connect()
await pgdb.public.discussions.insert({ title: 'asdf' })
await pgdb.public.discussions.insert({ title: 'asdf2' })
await pgdb.public.discussions.insert({ title: 'asdf3' })
PgDb.disconnect(pgdb)
*/

const serverName = 'republik'

const relativeServerPath = `../../../servers/${serverName}/`

// load env of server
require('@orbiting/backend-modules-env').config(
  path.join(__dirname, relativeServerPath, '.env')
)
// require server's server.js and start
const Server = require(`${relativeServerPath}server`)

Server.start()
  .then(async (server) => {
    setTimeout(() => {
      server.close()
        .then(() => {
          setTimeout(() => log(), 1000).unref()
        })
    }, 1000).unref()
  })
