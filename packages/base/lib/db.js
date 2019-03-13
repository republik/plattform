const PgDb = require('./pgdb')
const exec = require('util').promisify(require('child_process').exec)

const execAndLog = (command) =>
  exec(command)
    .catch( e =>
      console.error(`${command}\n${e.stderr}`)
    )

const create = (name) =>
  execAndLog(`psql -c 'create database ${name};' -U postgres`)

const drop = (name) =>
  execAndLog(`psql -c 'drop database ${name};' -U postgres`)

const getDatabaseUrl = (name) =>
  `postgres://postgres@localhost:5432/${name}`

const migrateUp = (url) => 
  execAndLog(`DATABASE_URL=${url} yarn run db:migrate:up`)

const connect = (url) =>
  PgDb.connect(url)

const createMigrateConnect = async (name) => {
  console.log(`DB createMigrateConnect: ${name}`)
  await create(name)
  const url = getDatabaseUrl(name)

  await migrateUp(url)

  return connect(url)
}

module.exports = {
  createMigrateConnect,
  drop
}
