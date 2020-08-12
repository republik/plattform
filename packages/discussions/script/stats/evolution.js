#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()
const { lib: { ConnectionContext } } = require('@orbiting/backend-modules-base')

const { populate } = require('../../lib/stats/evolution')

const applicationName = 'backends discussions script stats evolution'

const dry = process.argv[2] === '--dry'

ConnectionContext.create(applicationName).then(async context => {
  console.log('Begin...')
  const result = await populate(context, dry)
  if (dry) {
    console.log(result)
  }
  console.log('Done.')

  return context
})
  .then(context => ConnectionContext.close(context))
