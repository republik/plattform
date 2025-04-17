import { getConfig } from '../../config'
import { SubscriptionType } from '../../types'

const {
  YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
  BENEFACTOR_SUBSCRIPTION_STRIPE_PRODUCT_ID,
  MONTHLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
} = getConfig()

export function getSubscriptionType(productId: string): SubscriptionType {
  switch (productId) {
    case MONTHLY_SUBSCRIPTION_STRIPE_PRODUCT_ID:
      return 'MONTHLY_SUBSCRIPTION'
    case YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID:
      return 'YEARLY_SUBSCRIPTION'
    case BENEFACTOR_SUBSCRIPTION_STRIPE_PRODUCT_ID:
      return 'BENEFACTOR_SUBSCRIPTION'
    default:
      throw new Error('Unknown product')
  }
}

export function isPledgeBased(metadata: any) {
  return 'pledgeId' in metadata
}

export function parseStripeDate(value: number): Date
export function parseStripeDate(value: null | undefined): undefined
export function parseStripeDate(
  value: number | null | undefined,
): Date | undefined
export function parseStripeDate(
  value: number | null | undefined,
): Date | undefined {
  if (typeof value === 'number') {
    return new Date(value * 1000)
  }
  return undefined
}
