import { Branded } from '@orbiting/backend-modules-types'
import { Offer, PriceDefinition } from '../shop'
import { Company, SubscriptionType } from '../types'

export type ValidOfferId = Branded<string, 'offerId'>
export type ValidSubscriptionOfferId = Branded<string, 'subscriptionOfferId'>

export type OfferId = ValidOfferId | ValidSubscriptionOfferId

export class OfferService {
  private offers: Map<string, Offer>

  constructor(activeOffers: Offer[]) {
    this.offers = new Map(activeOffers.map((offer) => [offer.id, offer]))
  }

  isValidOffer(offerId: string): asserts offerId is ValidOfferId {
    if (!this.offers.has(offerId)) throw new Error('Invalid Offer')
  }

  isValidSubscriptionOffer(
    offerId: string,
  ): asserts offerId is ValidSubscriptionOfferId {
    const offer = this.offers.get(offerId)
    if (!offer || offer.type !== 'SUBSCRIPTION') {
      throw new Error('Invalid Offer')
    }
  }

  getOfferMerchent(offerId: OfferId): Company {
    return this.offers.get(offerId)!.company
  }

  getOfferItems(offerId: OfferId): PriceDefinition[] {
    return this.offers.get(offerId)!.items
  }

  getSubscriptionType(offerId: ValidSubscriptionOfferId): SubscriptionType {
    const offer = this.offers.get(offerId)!

    if (offer.type === 'SUBSCRIPTION') {
      return offer.subscriptionType
    }

    throw new Error(`Unable to get subscriptionType on offerType ${offer.type}`)
  }

  resolveUpgradePaths(subType: SubscriptionType): OfferId[] {
    switch (subType) {
      case 'MONTHLY_SUBSCRIPTION':
        return [
          'YEARLY',
          'YEARLY_REDUCED',
          'STUDENT',
          'BENEFACTOR',
        ] as OfferId[]

      case 'YEARLY_SUBSCRIPTION':
        return ['BENEFACTOR', 'DONATION'] as OfferId[]

      case 'BENEFACTOR_SUBSCRIPTION':
        return ['DONATION'] as OfferId[]
    }
  }
}
