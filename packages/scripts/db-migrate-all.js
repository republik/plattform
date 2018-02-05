const exec = require('child-process-promise').exec

module.exports = (_migrationDirs) => Promise.resolve().then( async () => {

  const args = process.argv.slice(2).join(' ')

  const migrationDirs = ['down', 'reset'].includes(args)
    ? _migrationDirs.slice().reverse()
    : _migrationDirs

  for(let migrationDir of migrationDirs) {
    const command = `yarn run db-migrate --migrations-dir ${migrationDir} ${args}`
    await exec(command)
      .then( result => {
        console.log(command, '\n', result.stdout);
      })
      .catch( e => {
        console.error(command, '\n', e.stderr)
      })
  }

})
