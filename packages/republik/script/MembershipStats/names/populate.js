#!/usr/bin/env node
/**
 * Script will populate underlying data for MembershipStats.names
 *
 * No options or arguments available.
 */
require('@orbiting/backend-modules-env').config()
const {
  lib: { ConnectionContext },
} = require('@orbiting/backend-modules-base')

const { populate } = require('../../../lib/MembershipStats/names')

const applicationName =
  'backends republik script MembershipStats names populate'

ConnectionContext.create(applicationName)
  .then(async (context) => {
    console.log('Begin...')
    await populate(context)
    console.log('Done.')

    return context
  })
  .then((context) => ConnectionContext.close(context))
