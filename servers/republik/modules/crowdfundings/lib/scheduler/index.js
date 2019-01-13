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

  const runIntervalSecsDeactivate = 60 * 60

  intervalScheduler.init({
    name: 'memberships-deactivate',
    context,
    runFunc: deactivate,
    lockTtlSecs: runIntervalSecsDeactivate,
    runIntervalSecs: runIntervalSecsDeactivate,
    runInitially: true
  })

  const runIntervalSecsChangeover = 60 * 15

  intervalScheduler.init({
    name: 'memberships-changeover-deactivate',
    context,
    runFunc: changeover,
    lockTtlSecs: runIntervalSecsChangeover,
    runIntervalSecs: runIntervalSecsChangeover,
    runInitially: true
  })
}

module.exports = {
  init
}
