const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const debug = require('debug')('crowdfundings:lib:scheduler')
const Promise = require('bluebird')

const {
  intervalScheduler,
  timeScheduler,
} = require('@orbiting/backend-modules-schedulers')

const lockTtlSecs = 60 * 5 // 5 mins

const { inform: informGivers } = require('./givers')
const { inform: informWinback } = require('./winbacks')
const { inform: informFeedback } = require('./feedback')
const { inform: informUpgrade } = require('./upgrade')
const { run: membershipsOwnersHandler } = require('./owners')
const { deactivate } = require('./deactivate')
const { changeover } = require('./changeover')
const { importPayments } = require('./importPayments')

const surplus = require('@orbiting/backend-modules-republik/graphql/resolvers/RevenueStats/surplus')
const {
  populate: populateMembershipStatsEvolution,
} = require('@orbiting/backend-modules-republik/lib/MembershipStats/evolution')
const countRange = require('@orbiting/backend-modules-republik/graphql/resolvers/MembershipStats/countRange')

const init = async (context) => {
  debug('init')

  const schedulers = []

  schedulers.push(
    timeScheduler.init({
      name: 'import-payments',
      context,
      runFunc: importPayments,
      lockTtlSecs,
      runAtTime: '04:00', // Postfinace exports new files at around 1 AM
      runInitially: DEV,
    }),
  )

  schedulers.push(
    timeScheduler.init({
      name: 'memberships-givers',
      context,
      runFunc: informGivers,
      lockTtlSecs,
      runAtTime: '06:00',
      runInitially: DEV,
    }),
  )

  schedulers.push(
    intervalScheduler.init({
      name: 'memberships-owners',
      context,
      runFunc: membershipsOwnersHandler,
      lockTtlSecs,
      runIntervalSecs: 60 * 10,
    }),
  )

  schedulers.push(
    intervalScheduler.init({
      name: 'feedback',
      context,
      runFunc: informFeedback,
      lockTtlSecs,
      runIntervalSecs: 60 * 10,
    }),
  )

  schedulers.push(
    intervalScheduler.init({
      name: 'upgrade',
      context,
      runFunc: informUpgrade,
      lockTtlSecs,
      runIntervalSecs: 60 * 10,
    }),
  )

  schedulers.push(
    timeScheduler.init({
      name: 'winback',
      context,
      runFunc: informWinback,
      lockTtlSecs,
      runAtTime: '18:32',
      runAtDaysOfWeek: [1, 2, 3, 4, 5],
      runInitially: DEV,
    }),
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
      runIntervalSecs: 60 * 10,
    }),
  )

  schedulers.push(
    intervalScheduler.init({
      name: 'stats-cache',
      context,
      runFunc: (args, context) =>
        Promise.all([
          surplus(null, { min: '2019-12-01', forceRecache: true }, context),
          populateMembershipStatsEvolution(context),
          countRange(
            null,
            {
              min: '2020-02-29T23:00:00Z',
              max: '2020-03-31T23:00:00Z',
              forceRecache: true,
            },
            context,
          ),
        ]),
      lockTtlSecs: 10,
      runIntervalSecs: 60,
    }),
  )

  const close = async () => {
    await Promise.each(schedulers, (scheduler) => scheduler.close())
  }

  return {
    close,
  }
}

module.exports = {
  init,
}
