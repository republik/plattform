import { Subscription } from '../../lib/types'
import { Payments } from '../../lib/payments'

export = {
  async invoices(subscription: Subscription) {
    return Payments.getInstance().getSubscriptionInvoices(subscription.id)
  },
}
