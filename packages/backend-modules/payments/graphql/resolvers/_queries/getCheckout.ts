import auth from '@orbiting/backend-modules-auth'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { InvoiceService } from '../../../lib/services/InvoiceService'
import {
  REPUBLIK_PAYMENTS_INTERNAL_REF,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN,
} from '../../../lib/constants'
import {
  SubscriptionUpgradeConfig,
  UpgradeService,
} from '../../../lib/services/UpgradeService'
import {
  Item,
  OnetimeItem,
  PaymentService,
} from '../../../lib/services/PaymentService'
import {
  CustomDonation,
  LineItem,
} from '../../../lib/shop/CheckoutSessionOptionBuilder'
import { TypedData } from '../../../lib/types'
import { getConfig } from '../../../lib/config'
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

  const order = await invoiceService.getOrder(args.orderId)
  if (!order || order.userId !== ctx.user.id) {
    return null
  }

  if (order.metadata[REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN] === 'UPGRADE') {
    const upgrade = await upgradeService.getUpgrade(
      order.metadata[REPUBLIK_PAYMENTS_INTERNAL_REF],
    )
    if (!upgrade) {
      return null
    }

    const { items, additionalItems } = await buildUpgradeItems(
      paymentService,
      offerService,
      upgrade.upgradeConfig,
    )

    const discount = buildUpgradeDiscounts(offerService, upgrade.upgradeConfig)

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

async function buildUpgradeItems(
  paymentService: PaymentService,
  offerService: OfferService,
  args: SubscriptionUpgradeConfig,
): Promise<{ items: Item[]; additionalItems: LineItem[] }> {
  offerService.isValidOffer(args.offerId)
  const companyName = offerService.getOfferMerchent(args.offerId)

  const lookupKeys = offerService
    .getOfferItems(args.offerId)
    .map((i) => i.lookupKey)

  const prices = await paymentService.getPrices(companyName, lookupKeys ?? [])
  const items: Item[] = prices.map((p) => ({ price: p.id, quantity: 1 }))
  const additionalItems: LineItem[] = []

  if (
    args.donation !== undefined ||
    offerService.supportsDonations(args.offerId)
  ) {
    const donation = buildDonationItem(args.donation)
    if (donation?.type === 'Item') {
      items.push(donation.data)
    } else if (donation?.type === 'OnetimeItem')
      additionalItems.push(donation.data)
  }

  return { items, additionalItems }
}

function buildDonationItem(
  donation?: CustomDonation,
): TypedData<'Item', Item> | TypedData<'OnetimeItem', OnetimeItem> | null {
  if (!donation || donation.amount < 0) return null

  if (!donation.recurring) {
    return {
      type: 'OnetimeItem',
      data: {
        price_data: {
          product: getConfig().PROJECT_R_DONATION_PRODUCT_ID,
          unit_amount: donation.amount,
          currency: 'CHF',
        },
        quantity: 1,
      },
    }
  }

  return {
    type: 'Item',
    data: {
      price_data: {
        product: getConfig().PROJECT_R_DONATION_PRODUCT_ID,
        unit_amount: donation.amount,
        currency: 'CHF',
        recurring: {
          interval: 'year',
          interval_count: 1,
        },
      },
      quantity: 1,
    },
  }
}

function buildUpgradeDiscounts(
  offerService: OfferService,
  args: SubscriptionUpgradeConfig,
): { promotion_code: string }[] | { coupon: string }[] {
  offerService.isValidOffer(args.offerId)

  if (!args.discount) {
    return []
  }

  const discount = args.discount

  if (discount.type === 'DISCOUNT') {
    return [{ coupon: discount.value.id }]
  }
  if (discount.type === 'PROMO') {
    return [{ promotion_code: discount.value.id }]
  }
  return []
}
