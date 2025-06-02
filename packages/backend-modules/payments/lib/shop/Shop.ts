import Stripe from 'stripe'
import { Company } from '../types'
import { Offer, OfferAPIResult, Discount, Promotion } from './offers'
import { PaymentService } from '../services/PaymentService'
import { Price } from './CheckoutSessionOptionBuilder'
import { OfferBuilder } from './OfferBuilder'

export class Shop {
  #offers: Offer[]
  #paymentServices: PaymentService

  constructor(offers: Offer[]) {
    this.#offers = offers
    this.#paymentServices = new PaymentService()
  }

  public async genLineItems(offer: Offer): Promise<Price[]> {
    const lookupKeys = offer.items.map((i) => i.lookupKey)
    const prices = await this.#paymentServices.getPrices(
      offer.company,
      lookupKeys,
    )

    return prices.map((p) => ({
      price: p.id,
      quantity: 1,
      tax_rates: offer.items.find((i) => i.lookupKey === p.lookup_key)
        ?.taxRateId
        ? [offer.items.find((i) => i.lookupKey === p.lookup_key)!.taxRateId!]
        : undefined,
    }))
  }

  isValidOffer(id: string) {
    const offer = this.#offers.find((offer) => id === offer.id)
    if (!offer) throw new Error('Invalid Offer')
    return offer
  }

  async getOfferById(
    id: string,
    promoCode?: string,
  ): Promise<OfferAPIResult | null> {
    const offer = this.#offers.find((o) => o.id === id)
    if (!offer) return null

    return new OfferBuilder(this.#paymentServices, offer)
      .withPromoCode(promoCode)
      .build()
  }

  async getOffers(promoCode?: string): Promise<OfferAPIResult[]> {
    return (
      await Promise.all([
        this.getOffersByCompany('REPUBLIK', promoCode),
        this.getOffersByCompany('PROJECT_R', promoCode),
      ])
    ).flat()
  }

  async getOffersByCompany(
    company: Company,
    promoCode?: string,
  ): Promise<OfferAPIResult[]> {
    const offers = this.#offers.filter((o) => o.company === company)
    if (!offers.length) return []

    const offerBuilder = new OfferBuilder(this.#paymentServices, offers)
    return offerBuilder.withPromoCode(promoCode).buildAll()
  }
}

export function promotionToDiscount(
  promotion: Stripe.PromotionCode,
): Promotion {
  return {
    id: promotion.id!,
    type: 'PROMO',
    name: promotion.coupon.name!,
    duration: promotion.coupon.duration,
    durationInMonths: promotion.coupon.duration_in_months,
    amountOff: promotion.coupon.amount_off!,
    currency: promotion.coupon.currency!,
  }
}

export function couponToDiscount(coupon: Stripe.Coupon): Discount {
  return {
    id: coupon.id!,
    type: 'DISCOUNT',
    name: coupon.name!,
    duration: coupon.duration,
    durationInMonths: coupon.duration_in_months,
    amountOff: coupon.amount_off!,
    currency: coupon.currency!,
  }
}
