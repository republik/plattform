//
// This script imports redirections from stdin.
// See ./seeds.example.json
//
// usage
// cat seeds/seeds.json | node seeds/seed.js [--truncate]
//

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const rw = require('rw')
const { upsert: upsertRedirection } = require('../lib/Redirections')

const truncate = process.argv[2] === '--truncate'

PgDb.connect().then(async (pgdb) => {
  const input = rw.readFileSync('/dev/stdin', 'utf8')
  if (!input) {
    throw new Error('missing expected input on stdin')
  }
  const redirections = JSON.parse(input)

  const transaction = await pgdb.transactionBegin()
  try {
    if (truncate) {
      console.log('TRUNCATING...')
      await transaction.query(`TRUNCATE TABLE redirections CASCADE`)
    }

    console.log('Seeding...')

    await Promise.all(redirections.map(
      redir => upsertRedirection(redir, { pgdb: transaction })
    ))

    const count = await transaction.public.redirections.count()
    console.log('num redirections: ' + count)
    console.log('done!')
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
