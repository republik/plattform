//
// This script runs db-migrate on multiple migrations directories
//
// usage
// node script/db-migrate-all.js [db-migrate args]
//
require('dotenv').config()
const { dbMigrateAll } = require('@orbiting/backend-modules-scripts')

const migrationDirs = [
  'node_modules/@orbiting/backend-modules-auth/migrations',
  'migrations/crowdfunding',
  'migrations'
]

dbMigrateAll(migrationDirs)
  .then(() => {
    process.exit()
  }).catch(e => {
    console.log(e)
    process.exit(1)
  })
