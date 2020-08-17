#!/usr/bin/env node
/**
 * Script will evaluate data for MembershipStats.evolution and print result.
 *
 * No options or arguments available.
 */
require('@orbiting/backend-modules-env').config()
const { lib: { ConnectionContext } } = require('@orbiting/backend-modules-base')

const { populate } = require('../../../lib/MembershipStats/evolution')

const applicationName = 'backends republik script MembershipStats evolution evaluate'

ConnectionContext.create(applicationName).then(async context => {
  console.log('Begin...')
  await populate(
    context,
    result => console.log(result)
  )
  console.log('Done.')

  return context
})
  .then(context => ConnectionContext.close(context))
