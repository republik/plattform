const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const debug = require('debug')('crowdfundings:lib:scheduler')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const redis = require('@orbiting/backend-modules-base/lib/redis')
const {
  intervalScheduler,
  timeScheduler
} = require('@orbiting/backend-modules-schedulers')

const lockTtlSecs = 5 * 60 // 10min

const { inform: informGivers } = require('./givers')
const { inform: informCancellers } = require('./winbacks')
const { inform: informOwners } = require('./owners')
const { deactivate } = require('./deactivate')
const { changeover } = require('./changeover')

const init = async (_context) => {
  debug('init')

  const pgdb = await PgDb.connect()
  const context = {
    ..._context,
    pgdb,
    redis
  }

  timeScheduler.init({
    name: 'memberships-givers',
    context,
    runFunc: informGivers,
    lockTtlSecs,
    runAtTime: '06:00',
    runInitially: DEV
  })

  timeScheduler.init({
    name: 'memberships-owners',
    context,
    runFunc: informOwners,
    lockTtlSecs,
    runAtTime: '06:30',
    runInitially: DEV
  })

  timeScheduler.init({
    name: 'winback',
    context,
    runFunc: informCancellers,
    lockTtlSecs,
    runAtTime: '18:32',
    runAtDaysOfWeek: [1, 2, 3, 4, 5],
    runInitially: DEV
  })

  intervalScheduler.init({
    name: 'changeover-deactivate',
    context,
    runFunc: async (args, context) => {
      await changeover(args, context)
      await deactivate(args, context)
    },
    lockTtlSecs,
    runIntervalSecs: 60 * 10
  })
}

module.exports = {
  init
}
