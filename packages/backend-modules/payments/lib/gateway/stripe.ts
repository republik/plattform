import Stripe from 'stripe'
import { getConfig } from '../config'

const config = getConfig()

export const ProjectRStripe = new Stripe(config.project_r_stripe_api_key, {
  // @ts-expect-error stripe-version-2020-08-27
  apiVersion: config.stripe_api_version,
})

export const RepublikAGStripe = new Stripe(config.republik_stripe_api_key, {
  // @ts-expect-error stripe-version-2020-08-27
  apiVersion: config.stripe_api_version,
})
