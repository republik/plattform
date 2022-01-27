import { debug as _debug } from 'debug'
import Promise from 'bluebird'

import { timeScheduler } from '@orbiting/backend-modules-schedulers'
import { ConnectionContext } from '@orbiting/backend-modules-types'

import { setup } from '../lib'

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const lockTtlSecs = 60 * 5 // 5 minutes

const init = async (context: ConnectionContext) => {
  const debug = _debug('databroom:lib:scheduler')
  debug('init')

  const scheduler = await timeScheduler.init({
    name: 'databroom',
    context,
    runFunc: async (args: any, context: any) => {
      const { dryRun } = args

      const jobFns = await setup({ dryRun, nice: true }, context)
      debug('%i jobs set up', jobFns.length)

      await Promise.each(jobFns, (fn) => fn())
    },
    lockTtlSecs,
    runAtTime: '03:00',
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
