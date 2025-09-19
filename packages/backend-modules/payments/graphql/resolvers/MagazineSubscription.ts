import { Subscription } from '../../lib/types'
import { PaymentService } from '../../lib/services/PaymentService'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { InvoiceService } from '../../lib/services/InvoiceService'
import { getConfig } from '../../lib/config'
import { UpgradeService } from '../../lib/services/UpgradeService'
import { SubscriptionUpgradeRepo } from '../../lib/database/SubscriptionUpgradeRepo'

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
    const paymentMethod = await paymentService.getPaymentMethodForSubscription(
      subscription.company,
      subscription.externalId,
    )
    return paymentMethod?.last4
      ? `${paymentMethod.method} *${paymentMethod.last4}`
      : paymentMethod?.method
  },

  async upgrade(subscription: Subscription, _args: never, ctx: GraphqlContext) {
    return new SubscriptionUpgradeRepo(ctx.pgdb)
      .getUnresolvedSubscriptionUpgrades(subscription.id)
      .then((u) => u[0])
  },
}
