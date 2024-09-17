import { Subscription } from '../../lib/types'
import { Payments } from '../../lib/payments'
import { PaymentProvider } from '../../lib/providers/provider'

export = {
  async stripeId(subscription: Subscription) {
    return subscription.externalId
  },
  async invoices(subscription: Subscription) {
    return Payments.getInstance().getSubscriptionInvoices(subscription.id)
  },
  async renewsAtPrice(subscription: Subscription) {
    const sub = await PaymentProvider.forCompany(
      subscription.company,
    ).getSubscription(subscription.externalId)
    if (!sub) {
      return null
    }

    return sub.items.data[0].price.unit_amount
  },
  async paymentMethod(subscription: Subscription) {
    const sub = await PaymentProvider.forCompany(
      subscription.company,
    ).getSubscription(subscription.externalId)
    if (!sub) {
      return null
    }

    const paymentMethod = await PaymentProvider.forCompany(
      subscription.company,
    ).getPaymentMethod(sub.default_payment_method as string)

    if (!paymentMethod) {
      return null
    }

    if (paymentMethod.card) {
      return `${capitalize(paymentMethod.card.brand)} *${
        paymentMethod.card.last4
      }`
    }

    if (paymentMethod.paypal) {
      return `Paypal`
    }

    if (paymentMethod.twint) {
      return `Twint`
    }

    return null
  },
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
