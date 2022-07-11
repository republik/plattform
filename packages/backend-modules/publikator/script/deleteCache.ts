/**
 * Script to delete Publikator related cache data in Redis.
 *
 * Uses Redis SCAN to walk through database in a non-blocking manner but
 * might take a while to scroll through all records.
 * (see https://redis.io/commands/scan/)
 *
 * Usage:
 * $ node script/deleteCache.js
 * $ DEBUG=* node script/deleteCache.js
 *
 */
require('@orbiting/backend-modules-env').config()

import { ConnectionContext } from '@orbiting/backend-modules-types'
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const applicationName = 'backends publikator script deleteCache'

const pattern = 'publikator:cache:*'
const mapFn = (key: string, client: any) => client.delAsync(key)

ConnectionContext.create(applicationName)
  .then(async (context: ConnectionContext) => {
    const { redis } = context

    console.log('So, this might take a while ...')

    await redis.scanMap({ pattern, mapFn })

    console.log('Done.')

    return context
  })
  .then((context: ConnectionContext) => ConnectionContext.close(context))
