const debug = require('debug')('mail:lib:scheduler')
const { timeScheduler } = require('@orbiting/backend-modules-schedulers')
import { archiveUnsubscribed } from './archiveUnsubscribed'
import bluebird from 'bluebird'

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

const init = async (context) => {
  debug('init')

  const schedulers: any[] = []

  schedulers.push(
    timeScheduler.init({
      name: 'archive-unsubscribed',
      context,
      runFunc: async (_args) => {
        const { dryRun } = _args
        debug(
          `starting job to archive unsubscribed users in audiences on mailchimp`,
        )
        await archiveUnsubscribed(dryRun)
      },
      lockTtlSecs: 60,
      runAtTime: '11:00',
      runAtDaysOfWeek: [7], // only on Sunday
      runInitially: DEV,
    }),
  )

  const close = async () => {
    await bluebird.each(schedulers, (scheduler) => scheduler.close())
  }

  return {
    close,
  }
}

export {
  init,
}
