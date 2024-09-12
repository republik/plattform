import { getConfig } from '../../config'
import { SubscriptionType } from '../../types'

const {
  YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
  MONTLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
} = getConfig()

export function getSubscriptionType(productId: string): SubscriptionType {
  switch (productId) {
    case MONTLY_SUBSCRIPTION_STRIPE_PRODUCT_ID:
      return 'MONTHLY_SUBSCRIPTION'
    case YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID:
      return 'YEARLY_SUBSCRIPTION'
    default:
      throw new Error('Unknown product')
  }
}
