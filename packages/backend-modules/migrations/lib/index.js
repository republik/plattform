const { PgDb } = require('pogi')

function parseDBConnectionString(urlString) {
  const url = new URL(urlString)
  const DATABASE = url.pathname.substring(1)
  url.pathname = '' // remove db name
  const CONNECTION_URI = url.toString()
  return {
    DATABASE,
    CONNECTION_URI,
  }
}

async function createDB(DATABASE_URL) {
  const { CONNECTION_URI, DATABASE } = parseDBConnectionString(DATABASE_URL)

  const pgdb = await PgDb.connect({
    application_name: 'setup',
    connectionString: CONNECTION_URI,
  })

  console.log(`Creating database "${DATABASE}"...`)
  await pgdb.run(`CREATE DATABASE "${DATABASE}"`)
  console.log(`Database "${DATABASE}" created.`)

  await pgdb.close()
}

module.exports = {
  createDB,
}
