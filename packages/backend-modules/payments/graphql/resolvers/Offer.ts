import { PaymentService } from '../../lib/services/PaymentService'
import { activeOffers, couponToDiscount, Offer } from '../../lib/shop'

export = {
  __resolveType: (offer: Offer, _args: never, _context: never) => {
    if (offer.id.startsWith('GIFT_')) {
      return 'GiftOffer'
    }

    return 'SubscriptionOffer'
  },
  discountOptions: async (offer: Offer, _args: never, _context: never) => {
    const paymentService = new PaymentService()
    const offerDefinition = activeOffers().find((o) => o.id === offer.id)
    if (!offerDefinition) {
      throw new Error('api/shop/unknownOffer')
    }

    if (typeof offer.discountOpitions === 'undefined') {
      return []
    }

    const results = (
      await Promise.allSettled(
        offer.discountOpitions.map(async (code) => {
          const coupon = await paymentService.getCoupon(
            offer.company,
            code.coupon,
          )
          return coupon ? { ...couponToDiscount(coupon) } : null
        }),
      )
    )
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((r) => r !== null)

    return results
  },
}
