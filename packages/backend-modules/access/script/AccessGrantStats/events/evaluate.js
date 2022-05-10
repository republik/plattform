#!/usr/bin/env node
/**
 * Script will evaluate data for AccessGrantStats.events and print result.
 *
 * No options or arguments available.
 */
require('@orbiting/backend-modules-env').config()
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const { populate } = require('../../../lib/AccessGrantStats/events')

const applicationName =
  'backends republik script AccessGrantStats events evaluate'

ConnectionContext.create(applicationName)
  .then(async (context) => {
    console.log('Begin...')
    await populate(context, (result) => console.log(JSON.stringify(result)))
    console.log('Done.')

    return context
  })
  .then((context) => ConnectionContext.close(context))
