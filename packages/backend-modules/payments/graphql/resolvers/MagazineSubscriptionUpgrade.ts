import { GraphqlContext } from '@orbiting/backend-modules-types'
import { PaymentService } from '../../lib/services/PaymentService'
import { getConfig } from '../../lib/config'
import Stripe from 'stripe'

const { PROJECT_R_DONATION_PRODUCT_ID } = getConfig()

export = {
  async billingDetails(root: any, _args: never, _ctx: GraphqlContext) {
    const ps = new PaymentService()
    const res = await ps.getScheduledSubscriptionInvoicePreview(
      root.subscriptionType.startsWith('YEARLY') ? 'PROJECT_R' : 'REPUBLIK',
      root.externalId,
    )

    const items = res.lines.data
    const donation = items.find(
      (item) =>
        item.pricing?.price_details?.product === PROJECT_R_DONATION_PRODUCT_ID,
    )

    const discount = res.discounts[0] as Stripe.Discount | null

    return {
      total: res.amount_due,
      discount: discount
        ? {
            id: discount.id,
            name: discount.coupon.name,
            duration: discount.coupon.duration,
            durationInMonths: discount.coupon.duration_in_months,
            endDate: discount.end ? new Date(discount.end * 1000) : null,
            amountOff: discount.coupon.amount_off,
            currency: discount.coupon.currency,
          }
        : null,
      donation: donation
        ? {
            amount: donation.amount,
          }
        : null,
      billingDate: res.next_payment_attempt
        ? new Date(res.next_payment_attempt * 1000)
        : null,
    }
  },
}
