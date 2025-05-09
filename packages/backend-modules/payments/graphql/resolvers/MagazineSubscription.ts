import { Subscription } from '../../lib/types'
import { PaymentService } from '../../lib/services/PaymentService'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { InvoiceService } from '../../lib/services/InvoiceService'
import { getConfig } from '../../lib/config'

const { PROJECT_R_DONATION_PRODUCT_ID } = getConfig()

export = {
  async stripeId(subscription: Subscription) {
    return subscription.externalId
  },
  async invoices(
    subscription: Subscription,
    _args: never,
    ctx: GraphqlContext,
  ) {
    return new InvoiceService(ctx.pgdb).getSubscriptionInvoices(subscription.id)
  },
  async renewsAtPrice(subscription: Subscription) {
    try {
      const nextInvoice = await new PaymentService().getInvoicePreview(
        subscription.company,
        subscription.externalId,
      )

      return nextInvoice?.total
    } catch {
      return null
    }
  },

  async donation(
    subscription: Subscription,
    _args: never,
    _ctx: GraphqlContext,
  ) {
    const items = await new PaymentService().listSubscriptionItems(
      subscription.company,
      subscription.externalId,
    )

    const donation = items.find(
      (item) => item.price.product === PROJECT_R_DONATION_PRODUCT_ID,
    )
    if (!donation) {
      return
    }

    return {
      amount: donation.price.unit_amount,
    }
  },

  async paymentMethod(subscription: Subscription) {
    const paymentService = new PaymentService()

    const sub = await paymentService.getSubscription(
      subscription.company,
      subscription.externalId,
    )
    if (!sub) {
      return null
    }

    const customer = await paymentService.getCustomer(
      subscription.company,
      sub.customer as string,
    )

    if (!customer || customer.deleted) {
      return null
    }

    const paymentMethodId =
      sub.default_payment_method ||
      customer.invoice_settings.default_payment_method

    if (typeof paymentMethodId !== 'string') {
      return null
    }

    const paymentMethod = await paymentService.getPaymentMethod(
      subscription.company,
      paymentMethodId,
    )

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
