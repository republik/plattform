import assert from 'node:assert'
const DEFAULT_SCHEMA_NAME = 'payments'
const DEFAULT_STRIPE_API_VERSION = '2020-08-27'

export type Config = {
  schemaName: string
  project_r_stripe_api_key: string
  republik_stripe_api_key: string
  stripe_api_version: string
  project_r_stripe_endpoint_secret: string
  republik_stripe_endpoint_secret: string
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
    schemaName: DEFAULT_SCHEMA_NAME,
    project_r_stripe_api_key: '',
    republik_stripe_api_key: '',
    stripe_api_version: DEFAULT_STRIPE_API_VERSION,
    project_r_stripe_endpoint_secret:
      process.env.STRIPE_PLATFORM_ENDPOINT_SECRET,
    republik_stripe_endpoint_secret:
      process.env.STRIPE_PLATFORM_ENDPOINT_SECRET,
  }
}
