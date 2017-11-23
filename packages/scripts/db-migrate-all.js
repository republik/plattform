const exec = require('child-process-promise').exec

module.exports = (migrationDirs) => Promise.resolve().then( async () => {

  for(let migrationDir of migrationDirs) {
    const command = `yarn run db-migrate --migrations-dir ${migrationDir} ${process.argv.slice(2).join(' ')}`
    await exec(command)
      .then( result => {
        console.log(command, '\n', result.stdout);
      })
      .catch( e => {
        console.error(command, '\n', e.stderr)
      })
  }

})
