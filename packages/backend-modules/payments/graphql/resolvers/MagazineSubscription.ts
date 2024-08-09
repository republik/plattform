import { Subscription } from '../../lib/types'
import { Payments } from '../../lib/payments'
import { GraphqlContext } from '@orbiting/backend-modules-types'
const { Roles } = require('@orbiting/backend-modules-auth')

export = {
  async stripeId(subscription: Subscription, _args: any, ctx: GraphqlContext) {
    Roles.ensureUserIsInRoles(ctx.user, ['admin', 'supporter'])

    return subscription.gatewayId
  },
  async invoices(subscription: Subscription) {
    return Payments.getInstance().getSubscriptionInvoices(subscription.id)
  },
}
