#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()
if (!process.env.DEBUG || process.env.DEBUG.indexOf('crowdfundings:pot') === -1) {
  process.env.DEBUG = [
    process.env.DEBUG,
    'crowdfundings:pot*'
  ].filter(Boolean).join(',')
}

const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const { refreshAllPots } = require('@orbiting/backend-modules-republik-crowdfundings/lib/membershipPot')

Promise.props({
  pgdb: PgDb.connect()
}).then(async (connections) => {
  await refreshAllPots(connections)

  return connections
})
  .then(async ({ pgdb }) => {
    await PgDb.disconnect(pgdb)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
