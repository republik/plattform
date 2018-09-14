//
// This script runs db-migrate on multiple migrations directories
//
// usage
// node script/db-migrate-all.js [db-migrate args]
//
require('@orbiting/backend-modules-env').config()
const { dbMigrateAll } = require('@orbiting/backend-modules-scripts')

const migrationDirs = [
  '../../packages/redirections/migrations',
  '../../packages/auth/migrations',
  '../republik/migrations/crowdfunding',
  '../republik/migrations',
  '../../packages/notifications/migrations',
  '../../packages/access/migrations'
]

dbMigrateAll(migrationDirs)
  .then(() => {
    process.exit()
  }).catch(e => {
    console.log(e)
    process.exit(1)
  })
