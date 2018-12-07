const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const debug = require('debug')('crowdfundings:lib:scheduler')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const redis = require('@orbiting/backend-modules-base/lib/redis')
const { timeScheduler: scheduler } = require('@orbiting/backend-modules-schedulers')

const lockTtlSecs = 5 * 60 // 10min

const { inform: informGivers } = require('./givers')
const { inform: informCancellers } = require('./winbacks')

const init = async (_context) => {
  debug('init')

  const pgdb = await PgDb.connect()
  const context = {
    ..._context,
    pgdb,
    redis
  }

  scheduler.init(
    'memberships',
    context,
    informGivers,
    '04:00',
    lockTtlSecs,
    DEV
  )

  scheduler.init(
    'winback',
    context,
    informCancellers,
    '16:32',
    lockTtlSecs,
    DEV
  )
}

module.exports = {
  init
}
