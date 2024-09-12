import assert from 'node:assert'
const DEFAULT_SCHEMA_NAME = 'payments'
const DEFAULT_STRIPE_API_VERSION = '2020-08-27'

export type Config = {
  SCHEMA_NAME: string
  PROJECT_R_STRIPE_API_KEY: string
  REPUBLIK_STRIPE_API_KEY: string
  STRIPE_API_VERSION: string
  PROJECT_R_STRIPE_ENDPOINT_SECRET: string
  REPUBLIK_STRIPE_ENDPOINT_SECRET: string
  MONTLY_SUBSCRIPTION_STRIPE_PRODUCT_ID: string
  YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID: string
}

export function getConfig(): Config {
  assert(
    typeof process.env.STRIPE_SECRET_KEY_PROJECT_R !== 'undefined',
    'STRIPE_SECRET_KEY_PROJECT_R not set',
  )
  assert(
    typeof process.env.STRIPE_SECRET_KEY_REPUBLIK !== 'undefined',
    'STRIPE_SECRET_KEY_REPUBLIK not set',
  )
  assert(
    typeof process.env.STRIPE_PLATFORM_ENDPOINT_SECRET !== 'undefined',
    'PROJECT R Stripe webhook secret not set',
  )
  assert(
    typeof process.env.STRIPE_CONNECTED_ENDPOINT_SECRET !== 'undefined',
    'REPUBLIK AG Stripe webhook secret not set',
  )
  assert(
    typeof process.env.YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID !== 'undefined',
    'YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID not set',
  )
  assert(
    typeof process.env.MONTLY_SUBSCRIPTION_STRIPE_PRODUCT_ID !== 'undefined',
    'MONTLY_SUBSCRIPTION_STRIPE_PRODUCT_ID not set',
  )

  return {
    SCHEMA_NAME: DEFAULT_SCHEMA_NAME,
    PROJECT_R_STRIPE_API_KEY: process.env.STRIPE_SECRET_KEY_PROJECT_R,
    REPUBLIK_STRIPE_API_KEY: process.env.STRIPE_SECRET_KEY_REPUBLIK,
    STRIPE_API_VERSION: DEFAULT_STRIPE_API_VERSION,
    PROJECT_R_STRIPE_ENDPOINT_SECRET:
      process.env.STRIPE_PLATFORM_ENDPOINT_SECRET,
    REPUBLIK_STRIPE_ENDPOINT_SECRET:
      process.env.STRIPE_CONNECTED_ENDPOINT_SECRET,
    YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID:
      process.env.YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
    MONTLY_SUBSCRIPTION_STRIPE_PRODUCT_ID:
      process.env.MONTLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
  }
}
