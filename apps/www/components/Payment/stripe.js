import loadScript from 'load-script'

import { STRIPE_PUBLISHABLE_KEY } from '../../lib/constants'

let promise
const loadStripeScript = () => {
  if (!promise) {
    if (window.Stripe) {
      promise = Promise.resolve(window.Stripe)
      return promise
    }
    promise = new Promise((resolve, reject) => {
      // since there is no unloading after checkout we disable advancedFraudSignals
      // https://mtlynch.io/stripe-update/#support-library-unloading
      loadScript(
        'https://js.stripe.com/v3?advancedFraudSignals=false',
        (error) => {
          if (error) {
            reject(error)
            promise = undefined
            return
          }
          resolve(window.Stripe)
        },
      )
    })
  }
  return promise
}

const initializedInstances = {}
export const loadStripe = (stripePublishableKey) => {
  const key = stripePublishableKey || STRIPE_PUBLISHABLE_KEY
  if (initializedInstances[key]) {
    return Promise.resolve(initializedInstances[key])
  }
  return loadStripeScript().then(() => {
    const instance = window.Stripe(key, {
      apiVersion: '2020-08-27',
      locale: 'de',
    })
    initializedInstances[key] = instance
    return instance
  })
}
