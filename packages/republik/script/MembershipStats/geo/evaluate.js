#!/usr/bin/env node
/**
 * Script will evaluate data for MembershipStats.geo and print result.
 *
 * No options or arguments available.
 */
require('@orbiting/backend-modules-env').config()
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const { populate } = require('../../../lib/MembershipStats/geo')

const applicationName = 'backends republik script MembershipStats geo evaluate'

ConnectionContext.create(applicationName)
  .then(async (context) => {
    console.log('Begin...')
    await populate(context, (result) => console.log(result))
    console.log('Done.')

    return context
  })
  .then((context) => ConnectionContext.close(context))
