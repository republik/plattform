/**
 * Script to delete cache data in Redis using a pattern
 *
 * Uses Redis SCAN to walk through database in a non-blocking manner but
 * might take a while to scroll through all records.
 * (see https://redis.io/commands/scan/)
 *
 * Usage:
 * $ node script/deleteCache.js --pattern "crowdfundings:cache:User:b86f9625-96b8-4886-b6b9-baf4fb657939*"
 * $ DEBUG=* node script/deleteCache.js --pattern "crowdfundings:cache:User:b86f9625-96b8-4886-b6b9-baf4fb657939*"
 *
 */
require('@orbiting/backend-modules-env').config()

import yargs from 'yargs'

import { ConnectionContext } from '@orbiting/backend-modules-types'
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const argv = yargs
  .option('pattern', {
    alias: 'p',
    string: true,
    demandOption: true,
  })
  .option('dry-run', {
    default: true,
  }).argv

const applicationName = 'backends utils script deleteCache'

const mapFn = (key: string, client: any) => {
  if (argv['dry-run']) {
    console.log('"%s" would be deleted', key)
    return true
  }

  console.log('"%s" deleting…', key)
  return client.delAsync(key)
}

ConnectionContext.create(applicationName)
  .then(async (context: ConnectionContext) => {
    const { redis } = context

    if (argv['dry-run']) {
      console.warn(
        'WARNING: In dry-run-mode, not deleting any keys. Disable with --no-dry-run',
      )
    }

    await redis.scanMap({
      pattern: argv.pattern,
      mapFn,
    })

    return context
  })
  .then((context: ConnectionContext) => ConnectionContext.close(context))
