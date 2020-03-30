const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const debug = require('debug')('crowdfundings:lib:scheduler')

const {
  intervalScheduler,
  timeScheduler
} = require('@orbiting/backend-modules-schedulers')

const lockTtlSecs = 60 * 5 // 5 mins

const { inform: informGivers } = require('./givers')
const { inform: informCancellers } = require('./winbacks')
const { run: membershipsOwnersHandler } = require('./owners')
const { deactivate } = require('./deactivate')
const { changeover } = require('./changeover')

const surplus = require('../../../../graphql/resolvers/RevenueStats/surplus')
const { populate: populateMembershipStatsEvolution } = require('../../../../lib/MembershipStats/evolution')
const countRange = require('../../../../graphql/resolvers/MembershipStats/countRange')

const init = async (context) => {
  debug('init')

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
      runFunc: membershipsOwnersHandler,
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

  // remove after campaign
  schedulers.push(
    intervalScheduler.init({
      name: 'stats-cache',
      context,
      runFunc: (args, context) =>
        Promise.all([
          surplus(null, { min: '2019-12-01', forceRecache: true }, context),
          populateMembershipStatsEvolution(context),
          countRange(null, { min: '2020-02-29T23:00:00Z', max: '2020-03-31T23:00:00Z', forceRecache: true }, context)
        ]),
      lockTtlSecs: 6,
      runIntervalSecs: 8
    })
  )

  const close = async () => {
    await Promise.each(schedulers, scheduler => scheduler.close())
  }

  return {
    close
  }
}

module.exports = {
  init
}
