import Stripe from 'stripe'
import { PaymentService } from '../services/PaymentService'
import { APIDiscountResult, Offer, OfferAPIResult } from './offers'
import { promotionToDiscount } from '.'

export class OfferBuilder {
  #paymentService: PaymentService
  #offers: Offer[]
  #promoCode?: string
  #priceData?: Stripe.Price[]

  constructor(paymentService: PaymentService, offer: Offer | Offer[]) {
    this.#paymentService = paymentService
    this.#offers = Array.isArray(offer) ? offer : [offer]
  }

  withPromoCode(promoCode?: string) {
    this.#promoCode = promoCode
    return this
  }

  async build(): Promise<OfferAPIResult> {
    if (!this.#priceData) await this.fetchPrices()
    return this.buildOfferData(this.#offers[0])
  }

  async buildAll(): Promise<OfferAPIResult[]> {
    if (!this.#priceData) await this.fetchPrices()
    return Promise.all(this.#offers.map((offer) => this.buildOfferData(offer)))
  }

  private async fetchPrices() {
    const lookupKeys = this.#offers.flatMap((o) =>
      o.items.map((i) => i.lookupKey),
    )

    this.#priceData = await this.#paymentService.getPrices(
      this.#offers[0].company,
      lookupKeys,
    )
  }

  private async buildOfferData(offer: Offer): Promise<OfferAPIResult> {
    const price = this.#priceData!.find(
      (p) => p.lookup_key === offer.items[0]?.lookupKey,
    )!

    const discount = await this.resolveDiscount(offer)

    return {
      ...offer,
      price: this.formatPrice(price),
      discount: discount ?? undefined,
    }
  }

  private async resolveDiscount(
    offer: Offer,
  ): Promise<APIDiscountResult | null> {
    if (offer.fixedDiscount) {
      const promotion = await this.#paymentService.getPromotion(
        offer.company,
        offer.fixedDiscount,
      )

      return promotion ? promotionToDiscount(promotion) : null
    }

    if (this.#promoCode && offer.allowPromotions) {
      const promotion = await this.#paymentService.getPromotion(
        offer.company,
        this.#promoCode,
      )
      return promotion ? promotionToDiscount(promotion) : null
    }

    return null
  }

  private formatPrice(price: Stripe.Price | null) {
    if (!price) {
      return {
        amount: 0,
        currency: 'chf',
      }
    }

    return {
      amount: price.unit_amount!,
      currency: price.currency,
      recurring: price.recurring
        ? {
            interval: price.recurring.interval as 'year' | 'month',
            intervalCount: price.recurring.interval_count,
          }
        : undefined,
    }
  }
}
