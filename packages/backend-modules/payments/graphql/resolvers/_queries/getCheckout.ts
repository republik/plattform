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
import { OfferService } from '../../../lib/services/OfferService'
import { activeOffers } from '../../../lib/shop'

export = async function getCheckout(
  _root: never,
  args: { orderId: string },
  ctx: GraphqlContext,
) {
  auth.ensureSignedIn(ctx)

  const invoiceService = new InvoiceService(ctx.pgdb)
  const upgradeService = new UpgradeService(ctx.pgdb, ctx.logger)
  const paymentService = new PaymentService()
  const offerService = new OfferService(activeOffers())

  const order = await invoiceService.getOrder({ id: args.orderId })
  if (!order || order.userId !== ctx.user.id) {
    return null
  }

  if (order.metadata[SUBSCRIPTION_ORIGIN] === ORIGIN_UPGRADE) {
    const upgrade = await upgradeService.getUpgrade(
      order.metadata[INTERNAL_REF],
    )
    if (!upgrade) {
      return null
    }

    const { items, additionalItems } = await upgradeService.buildUpgradeItems(
      upgrade.upgradeConfig,
    )

    const discount = offerService.buildDiscount(upgrade.upgradeConfig.discount)

    const invoicePreview = await paymentService.getInvoicePreview(
      order.company,
      {
        preview_mode: 'next',
        subscription_details: {
          items: items,
        },
        invoice_items: additionalItems,
        discounts: discount ?? [],
      },
    )

    return {
      total: invoicePreview.total,
      discount:
        invoicePreview.total_discount_amounts?.reduce((acc, d) => {
          return acc + d.amount
        }, 0) || 0,
      tax:
        invoicePreview.total_taxes?.reduce((acc, t) => {
          return acc + t.amount
        }, 0) || 0,
    }
  }

  const sess = await paymentService.getCheckoutSession(
    order.company,
    order.externalId,
  )

  return {
    orderId: order.id,
    sessionId: sess?.id,
    total: sess?.amount_total,
    discounts: sess?.total_details?.amount_discount,
    tax: sess?.total_details?.amount_tax,
  }
}
