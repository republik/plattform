#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()
const { lib: { ConnectionContext } } = require('@orbiting/backend-modules-base')

const { populate } = require('../../../lib/stats/last')

const applicationName = 'backends collections script stats last populate'

ConnectionContext.create(applicationName).then(async context => {
  console.log('Begin...')
  await populate(context)
  console.log('Done.')

  return context
})
  .then(context => ConnectionContext.close(context))
