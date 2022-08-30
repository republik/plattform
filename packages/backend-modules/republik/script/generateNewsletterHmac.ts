require('@orbiting/backend-modules-env').config()

import yargs from 'yargs'

const { t } = require('@orbiting/backend-modules-translate')
const base64u = require('@orbiting/backend-modules-base64u')

const { authenticate } = require('../lib/Newsletter')

const { FRONTEND_BASE_URL } = process.env

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

const hmac = authenticate(email, name, 1, t)
const confirmLink = `${FRONTEND_BASE_URL}/mitteilung?type=newsletter&name=${name}&subscribed=1&email=${base64u.encode(
  email,
)}&mac=${hmac}&context=newsletter`

console.log({
  email,
  name,
  hmac,
  confirmLink,
})
