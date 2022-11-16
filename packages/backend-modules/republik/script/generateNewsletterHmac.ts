require('@orbiting/backend-modules-env').config()

import yargs from 'yargs'

const { getConsentLink } = require('../lib/Newsletter')

const argv: { email: string; name: string } = yargs
  .option('email', {
    description: 'Email address',
    required: true,
    type: 'string',
  })
  .option('name', {
    description: 'Newsletter subscription name',
    required: true,
    type: 'string',
  }).argv

const { email, name } = argv

console.log({
  email,
  name,
  confirmLink: getConsentLink(email, name),
})
