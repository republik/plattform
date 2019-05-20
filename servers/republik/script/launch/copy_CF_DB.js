/*
 * This script copies the postgres DB to republik.
 * This only works locally, not on heroku.
 *
 * usage:
 * node script/launch/copy_CF_DB.js [PG_USERNAME]
 */

process.on('unhandledRejection', up => { throw up })

const exec = require('util').promisify(require('child_process').exec)

const username = process.argv[2]

Promise.resolve().then(async () => {
  if (!username) {
    throw new Error('missing postgres username as first argument')
  }
  await exec(`dropdb republik`)
    .then(r => console.log(r.stdout, r.stderr))
    .catch(e => {})
  await exec(`createdb republik`)
    .then(r => console.log(r.stdout, r.stderr))

  const DATABASE_URL = `postgres://${username}@localhost:5432/republik`

  await exec(`pg_dump postgres://${username}@localhost:5432/postgres | psql ${DATABASE_URL}`)
    .then(r => console.log(r.stdout, r.stderr))
})
.then(() => {
  process.exit(0)
})
