#!/usr/bin/env node
//
// This script runs db-migrate for all migrations files.
//
// usage
// node script/db-migrate-all.js [db-migrate args]
//
require('@orbiting/backend-modules-env').config()
const dbMigrateAll = require('@orbiting/backend-modules-base/lib/db-migrate-all')

const migrationDirs = [
  './servers/republik/migrations/crowdfunding',
  './servers/republik/migrations',
  './packages/redirections/migrations',
  './packages/auth/migrations',
  './packages/discussions/migrations',
  './packages/notifications/migrations',
  './packages/access/migrations',
  './packages/preview/migrations',
  './packages/voting/migrations',
  './packages/collections/migrations'
]

dbMigrateAll(migrationDirs)
  .catch(e => {
    console.log(e)
    process.exit(1)
  })
