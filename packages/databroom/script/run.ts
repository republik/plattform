import { debug as _debug } from 'debug'
import Promise from 'bluebird'
import yargs from 'yargs'

require('@orbiting/backend-modules-env').config()
import base from '@orbiting/backend-modules-base'
import { Context } from '@orbiting/backend-modules-types'

import { setup } from '../lib'

const argv = yargs
  .option('dryRun', {
    description: 'Don\'t make changes',
    default: true,
  })
  .option('nice', {
    description: 'Avoid overpowering data sources',
    default: true,
  })
  .argv

const debug = _debug('databroom:script:run')
debug('%o', argv)

const broom = async (context: Context) => {
  debug('ConnectionContext available')

  const { dryRun, nice } = argv
  const options = { dryRun, nice }

  const jobFns = await setup(options, context)
  debug('%i jobs set up', jobFns.length)

  await Promise.each(jobFns, fn => fn())
}

base.lib.ConnectionContext
  .create('databroom')
  .then(async (context: Context) => {
    await broom(context).catch((error: any) => {
      console.error(error)
    })

    return context
  })
  .then((context: Context) => base.lib.ConnectionContext.close(context))
  .catch((error: any) => {
    console.error(error)
  })
  .finally(() => debug('done'))
