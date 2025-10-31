import auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { InvoiceService } from '../../../lib/services/InvoiceService'
import {
  REPUBLIK_PAYMENTS_INTERNAL_REF as INTERNAL_REF,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN as SUBSCRIPTION_ORIGIN,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN_TYPE_UPGRADE as ORIGIN_UPGRADE,
} from '../../../lib/constants'
import { UpgradeService } from '../../../lib/services/UpgradeService'
import { PaymentService } from '../../../lib/services/PaymentService'

export = async function getCheckout(
  _root: never,
  args: { orderId: string },
  ctx: GraphqlContext,
) {
  auth.ensureSignedIn(ctx)

  const invoiceService = new InvoiceService(ctx.pgdb)
  const upgradeService = new UpgradeService(ctx.pgdb, ctx.logger)
  const paymentService = new PaymentService()

  const order = await invoiceService.getOrder({ id: args.orderId })
  if (!order || order.userId !== ctx.user.id) {
    return null
  }

  const sess = await paymentService.getCheckoutSession(
    order.company,
    order.externalId,
  )
  if (!sess) {
    return null
  }

  const checkoutSession = {
    orderId: order.id,
    company: order.company,
    sessionId: sess.id,
    clientSecret: sess.client_secret,
    url: sess.url,
  }

  if (order.metadata[SUBSCRIPTION_ORIGIN] === ORIGIN_UPGRADE) {
    const upgradeId = order.metadata[INTERNAL_REF]
    const breakdown = await upgradeService.previewInvoiceBreakdown(
      order.company,
      upgradeId,
    )

    return {
      ...checkoutSession,
      breakdown,
    }
  } else {
    return {
      ...checkoutSession,
      breakdown: {
        total: sess.amount_total,
        discount: sess.total_details?.amount_discount,
        tax: sess.total_details?.amount_tax,
      },
    }
  }
}
