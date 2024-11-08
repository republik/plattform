import Stripe from 'stripe'
import { Company } from '../types'
import { Offer } from './offers'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'

export class Store {
  #offers: Offer[]
  #stripeAdapters: Record<Company, Stripe> = {
    PROJECT_R: ProjectRStripe,
    REPUBLIK: RepublikAGStripe,
  }

  constructor(offers: Offer[]) {
    this.#offers = offers
  }

  async getOfferById(
    id: string,
    options?: { withDiscount: boolean },
  ): Promise<Offer | null> {
    const offer = this.#offers.find((offer) => id === offer.id)

    if (!offer) {
      return null
    }

    const price = (
      await this.#stripeAdapters[offer.company].prices.list({
        active: true,
        type: 'recurring',
        lookup_keys: [offer.defaultPriceLookupKey],
        expand: ['data.product'],
      })
    ).data[0]

    return this.mergeOfferData(offer, price, options)
  }

  async getOffers(options?: { withDiscount: boolean }): Promise<Offer[]> {
    return (
      await Promise.all([
        this.getOffersByCompany('REPUBLIK', options),
        this.getOffersByCompany('PROJECT_R', options),
      ])
    ).flat()
  }

  async getOffersByCompany(
    company: Company,
    options?: { withDiscount: boolean },
  ) {
    const offers = this.#offers.filter((offer) => company === offer.company)
    const lookupKeys = offers.map((o) => o.defaultPriceLookupKey)

    const priceData = (
      await this.#stripeAdapters[company].prices.list({
        active: true,
        type: 'recurring',
        lookup_keys: lookupKeys,
        expand: ['data.product'],
      })
    ).data

    return Promise.all(
      offers.map(async (offer) => {
        const price = priceData.find(
          (p) => p.lookup_key === offer.defaultPriceLookupKey,
        )!

        return this.mergeOfferData(offer, price, options)
      }),
    )
  }

  private async mergeOfferData(
    base: Offer,
    price: Stripe.Price,
    options?: { withDiscount: boolean },
  ): Promise<Offer> {
    let discount = null
    if (options?.withDiscount && base.entryCode) {
      const promotion = await this.getPromotion(base.company, base.entryCode)
      discount = promotion
        ? {
            name: promotion.coupon.name!,
            amountOff: promotion.coupon.amount_off!,
            currency: promotion.coupon.currency!,
          }
        : null
    }

    return {
      ...base,
      price: {
        id: price.id,
        amount: price.unit_amount!,
        currency: price.currency,
      },
      discount: discount,
    }
  }

  async getPromotion(
    company: Company,
    promoCode: string,
  ): Promise<Stripe.PromotionCode | null> {
    const promition = await this.#stripeAdapters[company].promotionCodes.list({
      active: true,
      code: promoCode,
      limit: 1,
    })

    if (promition.data.length !== 1) {
      return null
    }

    return promition.data[0]
  }
}
