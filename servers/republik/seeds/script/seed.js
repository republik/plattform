#!/usr/bin/env node

require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const seedCrowdfundings = require('../seedCrowdfundings')

PgDb.connect().then(async (pgdb) => {
  await seedCrowdfundings(pgdb)
}).then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
