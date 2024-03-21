import Stripe from 'stripe'

export type ActiveMonthlySubscriptionMembership = {
  active: true
  subscriptionId: string
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_REPUBLIK as string, {
  apiVersion: '2020-08-27',
  typescript: true,
})

export function applyStripeCampaignCoupon(
  membership: ActiveMonthlySubscriptionMembership,
) {
  const coupon = process.env.STRIPE_REFERRAL_CAMPAIGN_COUPON_ID
  if (!coupon) {
    throw new Error('Stripe coupon not provided')
  }

  return stripe.subscriptions.update(membership.subscriptionId, {
    coupon: coupon,
  })
}

export function ensureActiveMonthlySubscription(
  membership: any,
): asserts membership is ActiveMonthlySubscriptionMembership {
  if (!membership?.active) {
    throw new Error('Membership not active')
  }

  if (typeof membership?.subscriptionId !== 'string') {
    throw new Error('Membership has no stripe subscription')
  }
}
