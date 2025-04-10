import Stripe from 'stripe'
import { Company } from '../types'
import { Offer, OfferAPIResult, Discount, Promotion } from './offers'
import { User } from '@orbiting/backend-modules-types'
import { PgDb } from 'pogi'
import { hasHadMembership } from './utils'
import { PaymentService } from '../services/PaymentService'
import { LineItem } from './CheckoutSessionOptionBuilder'
import { OfferBuilder } from './OfferBuilder'

export const INTRODUCTERY_OFFER_PROMO_CODE = 'EINSTIEG'

export function isPromoCodeInBlocklist(promoCode: string) {
  return [INTRODUCTERY_OFFER_PROMO_CODE].includes(promoCode)
}
export class Shop {
  #offers: Offer[]
  #paymentServices: PaymentService

  constructor(offers: Offer[]) {
    this.#offers = offers
    this.#paymentServices = new PaymentService()
  }

  public async genLineItems(offer: Offer): Promise<LineItem[]> {
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

export async function checkIntroductoryOfferEligibility(
  pgdb: PgDb,
  user?: User,
): Promise<boolean> {
  if (
    process.env.PAYMENTS_INTRODUCTORY_OFFER_ELIGIBILITY_FOR_EVERYONE === 'true'
  ) {
    return true
  }

  if (!user) {
    // if there is no user we show the entry offers
    return true
  }

  if ((await hasHadMembership(user?.id, pgdb)) === false) {
    return true
  }

  return false
}
