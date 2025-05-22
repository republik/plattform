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

    const customer = await PaymentProvider.forCompany(
      subscription.company,
    ).getCustomer(sub.customer as string)

    if (!customer) {
      return null
    }

    const paymentMethodId =
      sub.default_payment_method ||
      customer.invoice_settings.default_payment_method

    if (typeof paymentMethodId !== 'string') {
      return null
    }

    const paymentMethod = await PaymentProvider.forCompany(
      subscription.company,
    ).getPaymentMethod(paymentMethodId)

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
