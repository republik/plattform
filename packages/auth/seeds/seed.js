//
// This script imports a json seed file.
// For now only users are supported.
// See ./seeds.example.json
// params
//   truncate: truncate tables before import
//   filename: the filenme to import
//
// usage
// cat seeds/seeds.json | node seeds/seed.js [--truncate]
//

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const rw = require('rw')

PgDb.connect().then(async (pgdb) => {
  const { truncate } = require('minimist')(process.argv.slice(2))

  const input = rw.readFileSync('/dev/stdin', 'utf8')
  if (!input) {
    throw new Error('missing expected input on stdin')
  }
  const { users } = JSON.parse(input)

  const transaction = await pgdb.transactionBegin()
  try {
    if (truncate) {
      console.log('TRUNCATING tables')
      const tables = [
        'users'
      ]
      for (let table of tables) {
        await transaction.query(`TRUNCATE TABLE ${table} CASCADE`)
      }
    }

    console.log('Seeding...')

    await Promise.all(users.map((user) => {
      return transaction.public.users.insert(user)
    }))

    const numUsers = await transaction.public.users.count()
    console.log('Num users: ' + numUsers)
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
