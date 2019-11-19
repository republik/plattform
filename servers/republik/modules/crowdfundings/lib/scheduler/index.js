const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const debug = require('debug')('crowdfundings:lib:scheduler')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const {
  intervalScheduler,
  timeScheduler
} = require('@orbiting/backend-modules-schedulers')

const lockTtlSecs = 60 * 5 // 5 mins

const { inform: informGivers } = require('./givers')
const { inform: informCancellers } = require('./winbacks')
const { inform: informOwners } = require('./owners')
const { deactivate } = require('./deactivate')
const { changeover } = require('./changeover')

const init = async (_context) => {
  debug('init')

  const pgdb = await PgDb.connect()
  const redis = Redis.connect()
  const context = {
    ..._context,
    pgdb,
    redis
  }

  const schedulers = []

  schedulers.push(
    timeScheduler.init({
      name: 'memberships-givers',
      context,
      runFunc: informGivers,
      lockTtlSecs,
      runAtTime: '06:00',
      runInitially: DEV
    })
  )

  schedulers.push(
    intervalScheduler.init({
      name: 'memberships-owners',
      context,
      runFunc: informOwners,
      lockTtlSecs,
      runIntervalSecs: 60 * 10
    })
  )

  schedulers.push(
    timeScheduler.init({
      name: 'winback',
      context,
      runFunc: informCancellers,
      lockTtlSecs,
      runAtTime: '18:32',
      runAtDaysOfWeek: [1, 2, 3, 4, 5],
      runInitially: DEV
    })
  )

  schedulers.push(
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
  )

  const close = async () => {
    await Promise.all(
      schedulers.map(scheduler => scheduler.close())
    )
    await Promise.all([
      PgDb.disconnect(pgdb),
      Redis.disconnect(redis)
    ])
  }

  return {
    close
  }
}

module.exports = {
  init
}
