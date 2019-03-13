const exec = require('util').promisify(require('child_process').exec)

const execAndLog = (command) =>
  exec(command)
    .then( result =>
      console.log(`${command}\n${result.stdout}`)
    )
    .catch( e =>
      console.error(`${command}\n${e.stderr}`)
    )

const {
  DATABASE_URL
} = process.env

module.exports = (_migrationDirs) => Promise.resolve().then( async () => {

  const args = process.argv.slice(2).join(' ') || 'up'

  const migrationDirs = ['down', 'reset'].includes(args)
    ? _migrationDirs.slice().reverse()
    : _migrationDirs

  for(let migrationDir of migrationDirs) {
    const command = `DATABASE_URL=${DATABASE_URL} yarn run db-migrate --migrations-dir ${migrationDir} ${args}`
    await execAndLog(command)
  }

})
