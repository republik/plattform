import fg from 'fast-glob'

import { Context } from '@orbiting/backend-modules-types'

export interface Options {
  dryRun?: boolean
}

export interface Job {
  clean(): Promise<any>
}

export async function setupJobs(options: Options, context: Context): Promise<Job[]> {
  const entries = await fg(
    'jobs/**/*.js',
    { cwd: __dirname, onlyFiles: true, absolute: true }
  )

  return entries.map(entry => require(entry)(options, context))
}

export async function runJob(job: Job) {
    const { clean } = job

    clean && await clean()
}
