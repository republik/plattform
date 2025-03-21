import { activeOffers, Offer, Shop } from '../../lib/shop'

export = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __resolveType: (offer: Offer, _args: never, _context: never) => {
    if (offer.id.startsWith('GIFT_')) {
      return 'GiftOffer'
    }

    return 'SubscriptionOffer'
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  discountOptions: async (offer: Offer, _args: never, _context: never) => {
    const shop = new Shop(activeOffers())
    const offerDefinition = activeOffers().find((o) => o.id === offer.id)
    if (!offerDefinition) {
      throw new Error('api/shop/unknownOffer')
    }

    if (typeof offer.discountOpitions === 'undefined') {
      return []
    }

    const results = (
      await Promise.allSettled(
        offer.discountOpitions.map((code) => shop.resolveDiscount(offer, code)),
      )
    )
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value?.value)
      .filter((r) => r !== undefined)

    return results
  },
}
