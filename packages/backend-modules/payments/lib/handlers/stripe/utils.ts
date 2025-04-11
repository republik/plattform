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

export function secondsToMilliseconds(seconds: number): number {
  return seconds * 1000
}
