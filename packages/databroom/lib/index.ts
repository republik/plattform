import fg from 'fast-glob'
import { Debugger } from 'debug'
import { basename } from 'path'
import * as stream from 'stream'

import { Context } from '@orbiting/backend-modules-types'

export interface DatabroomContext extends Context {
  debug: Debugger
}

export interface Options {
  dryRun?: boolean
  nice?: boolean
}


interface LibJob {
  name: string
  path: string
}
export interface Job {
  clean(): Promise<any>
}

interface ProcessStreamHandler {
  (row: any): Promise<any>
}


async function getJobs(context: DatabroomContext): Promise<LibJob[]> {
  const { debug } = context
  const glob = 'jobs/**/*.js'

  debug('find in %s with "%s', __dirname, glob)
  const paths = await fg(
    glob,
    { cwd: __dirname, onlyFiles: true, absolute: true }
  )
  debug('%i jobs found', paths.length)

  return paths.map(path => ({ name: basename(path, '.js'), path }))
}

export async function setupJobs(options: Options, context: DatabroomContext): Promise<Job[]> {
  const { debug } = context

  debug(options)

  const jobs = await getJobs({ ...context, debug: debug.extend('getJobs') })

  return jobs.map(job => {
    debug('setup %s', job.name)
    return require(job.path)(options, { ...context, debug: debug.extend(job.name) })
  })
}

export async function mapPogiTable(
  table: string,
  conditions: object,
  options: object,
  handler: ProcessStreamHandler,
  context: DatabroomContext
) {
  const { pgdb, debug: _debug } = context
  const debug = _debug.extend('mapRows')

  debug('table: %s', table)
  debug('conditions: %o', conditions)
  debug('options: %o', options)

  const qryConditions = conditions
  const pogiTable = pgdb.public[table]

  debug('counting rows ...')
  const count = await pogiTable.count(qryConditions)
  debug('%i rows found', count)

  const qryOptions = {
    ...options,
    stream: true,
  }

  const qryStream = await pogiTable.find(qryConditions, qryOptions)

  debug('processing stream with handler ...')
  await processStream(
    qryStream,
    handler
  )
  debug('processing stream is done')
}

export async function processStream(stream: stream.Readable, rowHandler: ProcessStreamHandler): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.on('data', async (row) => {
      stream.pause()
      await rowHandler(row)
      stream.resume()
    })

    stream.on('end', resolve)
    stream.on('error', reject)
  })
}
