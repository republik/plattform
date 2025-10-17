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

export const GIFTS_ENABLED = () =>
  process.env.PAYMENTS_SHOP_GIFTS_ENABLED === 'true'

export class CheckoutProcessingError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'CheckoutProcessingError'
  }
}
