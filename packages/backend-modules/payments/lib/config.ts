import { z } from 'zod'
const DEFAULT_SCHEMA_NAME = 'payments'
const STRIPE_API_VERSION = '2025-08-27.basil'
// const STRIPE_CUSTOM_CHECKOUT_API_VERSION = '2025-08-27; custom_checkout_beta=v1'

const keyToEnvMap = {
  SHOP_BASE_URL: 'SHOP_BASE_URL',
  PROJECT_R_STRIPE_API_KEY: 'STRIPE_SECRET_KEY_PROJECT_R',
  REPUBLIK_STRIPE_API_KEY: 'STRIPE_SECRET_KEY_REPUBLIK',
  PROJECT_R_STRIPE_ENDPOINT_SECRET: 'PAYMENTS_PROJECT_R_STRIPE_ENDPOINT_SECRET',
  REPUBLIK_STRIPE_ENDPOINT_SECRET: 'PAYMENTS_REPUBLIK_STRIPE_ENDPOINT_SECRET',
  MONTHLY_SUBSCRIPTION_STRIPE_PRODUCT_ID:
    'MONTHLY_SUBSCRIPTION_STRIPE_PRODUCT_ID',
  YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID:
    'YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID',
  BENEFACTOR_SUBSCRIPTION_STRIPE_PRODUCT_ID:
    'PAYMENTS_BENEFACTOR_SUBSCRIPTION_STRIPE_PRODUCT_ID',
  REPUBLIK_STRIPE_SUBSCRIPTION_TAX_ID:
    'PAYMENTS_REPUBLIK_STRIPE_SUBSCRIPTION_TAX_ID',
  REPUBLIK_STRIPE_PAYMENTS_CONFIG_ID:
    'PAYMENTS_REPUBLIK_STRIPE_PAYMENTS_CONFIG_ID',
  PROJECT_R_STRIPE_PAYMENTS_CONFIG_ID:
    'PAYMENTS_PROJECT_R_STRIPE_PAYMENTS_CONFIG_ID',
  REPUBLIK_3_MONTH_GIFT_COUPON: 'PAYMENTS_REPUBLIK_3_MONTH_GIFT_COUPON',
  PROJECT_R_3_MONTH_GIFT_COUPON: 'PAYMENTS_PROJECT_R_3_MONTH_GIFT_COUPON',
  PROJECT_R_YEARLY_GIFT_COUPON: 'PAYMENTS_PROJECT_R_YEARLY_GIFT_COUPON',
  PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS:
    'PAYMENTS_PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS',
  PROJECT_R_DONATION_PRODUCT_ID: 'PAYMENTS_PROJECT_R_DONATION_PRODUCT_ID',
} as const

const configSchema = z.object({
  SCHEMA_NAME: z.string().default(DEFAULT_SCHEMA_NAME),
  SHOP_BASE_URL: z.string().url('Invalid shop base URL'),
  PROJECT_R_STRIPE_API_KEY: z
    .string()
    .min(1, 'Project R Stripe API key required'),
  REPUBLIK_STRIPE_API_KEY: z
    .string()
    .min(1, 'Republik Stripe API key required'),
  STRIPE_API_VERSION: z.string().default(STRIPE_API_VERSION),
  PROJECT_R_STRIPE_ENDPOINT_SECRET: z
    .string()
    .min(1, 'Project R Stripe webhook secret required'),
  REPUBLIK_STRIPE_ENDPOINT_SECRET: z
    .string()
    .min(1, 'Republik Stripe webhook secret required'),
  MONTHLY_SUBSCRIPTION_STRIPE_PRODUCT_ID: z.string().min(1),
  YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID: z.string().min(1),
  BENEFACTOR_SUBSCRIPTION_STRIPE_PRODUCT_ID: z.string().min(1),
  REPUBLIK_STRIPE_SUBSCRIPTION_TAX_ID: z.string().min(1),
  REPUBLIK_STRIPE_PAYMENTS_CONFIG_ID: z.string().min(1),
  PROJECT_R_STRIPE_PAYMENTS_CONFIG_ID: z.string().min(1),
  REPUBLIK_3_MONTH_GIFT_COUPON: z.string().min(1),
  PROJECT_R_3_MONTH_GIFT_COUPON: z.string().min(1),
  PROJECT_R_YEARLY_GIFT_COUPON: z.string().min(1),
  PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS: z
    .string()
    .default('')
    .transform((s) => (s ? s.split(';') : [])),
  PROJECT_R_DONATION_PRODUCT_ID: z.string().min(1),
})

export type Config = z.infer<typeof configSchema>

function mapEnvToConfig(
  env: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const mapped: Record<string, string | undefined> = {}

  for (const [configKey, envKey] of Object.entries(keyToEnvMap)) {
    mapped[configKey] = env[envKey]
  }

  // Add non-mapped variables
  mapped.SHOP_BASE_URL = env.SHOP_BASE_URL
  mapped.SCHEMA_NAME = env.SCHEMA_NAME

  return mapped
}

export function getConfig(): Config {
  const mappedEnv = mapEnvToConfig(process.env)
  const result = configSchema.safeParse(mappedEnv)

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('\n')
    throw new Error(`Configuration validation failed:\n${errors}`)
  }

  return result.data
}
