import Promise from 'bluebird'
import yargs from 'yargs'
import { debug as _debug } from 'debug'

require('@orbiting/backend-modules-env').config()
import base from '@orbiting/backend-modules-base'
import { Context } from '@orbiting/backend-modules-types'

import { setupJobs } from '../lib'

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

base.lib.ConnectionContext
  .create('databroom')
  .then(async (context: Context) => {
    debug('ConnectionContext available')
  
    const { dryRun, nice } = argv
    const options = { dryRun, nice }

    const jobs = await setupJobs(
      options,
      { ...context, debug: debug.extend('setupJobs') }
    )
    debug('%i jobs set up', jobs.length)

    await Promise.each(jobs, job => job?.clean())

    return context
  })
  .then((context: Context) => base.lib.ConnectionContext.close(context))
  .finally(() => debug('done'))
