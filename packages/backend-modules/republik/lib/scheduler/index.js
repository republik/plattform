const debug = require('debug')('republik:lib:scheduler')
const { dayOfMonthScheduler } = require('@orbiting/backend-modules-schedulers')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

const init = async (context) => {
  debug('init')

  const schedulers = []

  schedulers.push(
    dayOfMonthScheduler.init({
      name: 'finance-calculate-kpis',
      context,
      runFunc: async (_args, context) => {
        // const { dryRun } = _args
        debug(`run script to calculate monthly KPIs`)
        // await calculateKpiScheduler
      },
      lockTtlSecs: 60,
      runAtTime: '08:00',
      runAtDayOfMonth: 15, // every month of the 15th
      runInitially: DEV,
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
