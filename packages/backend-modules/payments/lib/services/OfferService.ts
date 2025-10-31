import {
  Company,
  DiscountOption,
  Offer,
  OfferId,
  PriceDefinition,
  SubscriptionType,
  TypedData,
  ValidOfferId,
  ValidSubscriptionOfferId,
} from '../types'
import { getConfig } from '../config'
import { CustomDonation } from '../shop/CheckoutSessionOptionBuilder'
import { Item, OnetimeItem } from './PaymentService'

export class OfferService {
  private offers: Map<string, Offer>

  constructor(activeOffers: Offer[]) {
    this.offers = new Map(activeOffers.map((offer) => [offer.id, offer]))
  }

  isValidOffer(offerId: string): asserts offerId is ValidOfferId {
    if (!this.offers.has(offerId)) throw new Error('api/shop/unknown/offer')
  }

  isValidSubscriptionOffer(
    offerId: string,
  ): asserts offerId is ValidSubscriptionOfferId {
    const offer = this.offers.get(offerId)
    if (!offer || offer.type !== 'SUBSCRIPTION') {
      throw new Error('api/shop/unknown/offer')
    }
  }

  getOfferMerchent(offerId: OfferId): Company {
    return this.offers.get(offerId)!.company
  }

  getOffer(offerId: OfferId): Offer {
    return this.offers.get(offerId)!
  }

  getOffers(): Offer[] {
    return Array.from(this.offers.values())
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

  supportsDonations(offerId: OfferId): boolean {
    return this.offers.get(offerId)!.company === 'PROJECT_R'
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

  buildDonationItem(
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

  buildDiscount(
    discount?: DiscountOption,
  ): { promotion_code: string }[] | { coupon: string }[] {
    if (!discount) {
      return []
    }

    if (discount.type === 'DISCOUNT') {
      return [{ coupon: discount.value.id }]
    }
    if (discount.type === 'PROMO') {
      return [{ promotion_code: discount.value.id }]
    }
    return []
  }
}
