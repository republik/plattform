import Stripe from 'stripe'
import { getConfig } from '../config'

const config = getConfig()

export const ProjectRStripe = new Stripe(config.PROJECT_R_STRIPE_API_KEY, {
  // @ts-expect-error stripe-version-2020-08-27 custom_checkout_beta=v1
  apiVersion: config.STRIPE_API_VERSION,
})

export const RepublikAGStripe = new Stripe(config.REPUBLIK_STRIPE_API_KEY, {
  // @ts-expect-error stripe-version-2020-08-27 custom_checkout_beta=v1
  apiVersion: config.STRIPE_API_VERSION,
})
