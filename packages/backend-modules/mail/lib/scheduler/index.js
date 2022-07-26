const debug = require('debug')('mail:lib:scheduler')
const { timeScheduler } = require('@orbiting/backend-modules-schedulers')
const dayjs = require('dayjs')
const cleanedUserMailing = require('./cleanedUserMailing')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

const init = async (context) => {
  debug('init')

  const scheduler = await timeScheduler.init({
    name: 'cleaned-user-mailing',
    context,
    runFunc: async (_args, context) => {
      const { now, dryRun } = _args
      const to = dayjs(now).format('YYYY-MM-DD')
      const from = dayjs(now).add(-7, 'day').format('YYYY-MM-DD')
      debug(
        `starting job to send mail to users who were cleaned from mailing list between ${from} and ${to}`,
      )
      await cleanedUserMailing(from, to, context, dryRun)
    },
    lockTtlSecs: 60,
    runAtTime: '13:00',
    runAtDaysOfWeek: [3],
    runInitially: DEV,
  })

  const close = async () => {
    await scheduler.close()
  }

  return {
    close,
  }
}

module.exports = {
  init,
}
