/**
 * This script helps connecting a stripe account.
 * NOTE: this only works if the provider account has NO redirectURLs configured.
 *
 * Usage:
 * node script/connectStripeAccount.js [authorization code]
 *
 * source:
 * https://stripe.com/docs/connect/standard-accounts
 */

require('@orbiting/backend-modules-env').config()
const fetch = require('isomorphic-unfetch')
const querystring = require('querystring')
const {
  STRIPE_PLATFORM_CLIENT_ID,
  STRIPE_SECRET_KEY_PROJECT_R
} = process.env

const authCode = process.argv[2]

Promise.resolve().then(async () => {
  if (!authCode) {
    console.log(`Open the following link:
https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${STRIPE_PLATFORM_CLIENT_ID}&scope=read_write
A page by stripe will appear on which you have to click "Connect my Stripe account".
After that you will be redirected to another page which shows you an autorization code. Rerun this script with
this code as parameter to complete the setup.
    `)
  } else {
    console.log('trying to get access_token from stripe...')

    const form = querystring.stringify({
      client_secret: STRIPE_SECRET_KEY_PROJECT_R,
      code: authCode,
      grant_type: 'authorization_code'
    })
    const contentLength = form.length
    const response = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form
    })
    console.log(await response.text())
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
