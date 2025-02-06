import { Offer } from '../../lib/shop'

export = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __resolveType: (offer: Offer, _args: never, _context: never) => {
    if (offer.id.startsWith('GIFT_')) {
      return 'GiftOffer'
    }

    return 'SubscriptionOffer'
  },
}
