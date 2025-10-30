import { getConfig } from './config'

const CONFIG = getConfig()

export const SUBSCRIPTION_PRODUCTS = [
  CONFIG.BENEFACTOR_SUBSCRIPTION_STRIPE_PRODUCT_ID,
  CONFIG.YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
  CONFIG.MONTHLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
] as const

export const DONATION_PRODUCTS = [CONFIG.PROJECT_R_DONATION_PRODUCT_ID] as const

export const INVOICE_PAYMENT_STATUS_TO_CHARGE_STATUS = {
  paid: 'succeeded',
  open: 'pending',
  canceled: 'failed',
} as const

export const REPUBLIK_PAYMENTS_SUBSCRIPTION_REPLACES =
  'republik:subscription:replaces'

export const REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN =
  'republik:subscription:origin'

export const REPUBLIK_PAYMENTS_INTERNAL_REF = 'republik:internal:ref'

export const GIFTS_ENABLED = () =>
  process.env.PAYMENTS_SHOP_GIFTS_ENABLED === 'true'
