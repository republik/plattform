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
}

export function getConfig(): Config {
  assert(
    typeof process.env.STRIPE_PLATFORM_ENDPOINT_SECRET !== 'undefined',
    'PROJECT R Stripe webhook secret not set',
  )
  assert(
    typeof process.env.STRIPE_CONNECTED_ENDPOINT_SECRET !== 'undefined',
    'REPUBLIK AG Stripe webhook secret not set',
  )

  return {
    SCHEMA_NAME: DEFAULT_SCHEMA_NAME,
    PROJECT_R_STRIPE_API_KEY: '',
    REPUBLIK_STRIPE_API_KEY: '',
    STRIPE_API_VERSION: DEFAULT_STRIPE_API_VERSION,
    PROJECT_R_STRIPE_ENDPOINT_SECRET:
      process.env.STRIPE_PLATFORM_ENDPOINT_SECRET,
    REPUBLIK_STRIPE_ENDPOINT_SECRET:
      process.env.STRIPE_CONNECTED_ENDPOINT_SECRET,
  }
}
