import Promise from 'bluebird'

require('@orbiting/backend-modules-env').config()
import base from '@orbiting/backend-modules-base'
import { Context } from '@orbiting/backend-modules-types'

import { setupJobs, runJob } from '../lib'

base.lib.ConnectionContext
  .create('datasweep')
  .then(async (context: Context) => {
    const options = { dryRun: true }
    const jobs = await setupJobs(options, context)

    await Promise.each(jobs, runJob)

    return context
  })
  .then((context: Context) => base.lib.ConnectionContext.close(context))
