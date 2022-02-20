#!/usr/bin/env node
/**
 * Script will populate underlying data for AccessGrantStats.events
 *
 * No options or arguments available.
 */
require('@orbiting/backend-modules-env').config()
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const { populate } = require('../../../lib/AccessGrantStats/events')

const applicationName =
  'backends republik script AccessGrantStats events populate'

ConnectionContext.create(applicationName)
  .then(async (context) => {
    console.log('Begin...')
    await populate(context)
    console.log('Done.')

    return context
  })
  .then((context) => ConnectionContext.close(context))
