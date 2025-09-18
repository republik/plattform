import Stripe from 'stripe'
import { PaymentService } from '../services/PaymentService'
import {
  APIDiscountResult,
  Offer,
  OfferAPIResult,
  OfferAvailability,
  resolveUpgradePaths,
} from './offers'
import { promotionToDiscount } from '.'
import { PgDb } from 'pogi'
import { SubscriptionService } from '../services/SubscriptionService'
import { Subscription } from '../types'

export class OfferBuilder {
  private paymentService: PaymentService
  private subscriptionService: SubscriptionService
  private offers: Offer[]
  private promoCode?: string
  private priceData?: Stripe.Price[]
  private context: {
    userId?: string
    activeSubscription?: Promise<Subscription | null>
  }

  constructor(
    paymentService: PaymentService,
    pgdb: PgDb,
    offer: Offer | Offer[],
  ) {
    this.paymentService = paymentService
    this.subscriptionService = new SubscriptionService(pgdb)
    this.context = {}

    this.offers = Array.isArray(offer) ? offer : [offer]
  }

  withContext(context: Record<string, any>): this {
    this.context = { ...context }

    if (this.context.userId) {
      const userId = this.context.userId

      this.context.activeSubscription = (async () => {
        const subs = await this.subscriptionService.listSubscriptions(userId, [
          'active',
        ])

        return subs[0]
      })()
    } else {
      this.context.activeSubscription = (async () => null)()
    }

    return this
  }

  withPromoCode(promoCode?: string): this {
    this.promoCode = promoCode
    return this
  }

  async build(): Promise<OfferAPIResult> {
    if (!this.priceData) await this.fetchPrices()
    return this.buildOfferData(this.offers[0])
  }

  async buildAll(): Promise<OfferAPIResult[]> {
    if (!this.priceData) await this.fetchPrices()
    return Promise.all(this.offers.map((offer) => this.buildOfferData(offer)))
  }

  private async fetchPrices() {
    const lookupKeys = this.offers.flatMap((o) =>
      o.items.map((i) => i.lookupKey),
    )

    this.priceData = await this.paymentService.getPrices(
      this.offers[0].company,
      lookupKeys,
    )
  }

  private async buildOfferData(offer: Offer): Promise<OfferAPIResult> {
    const price = this.priceData!.find(
      (p) => p.lookup_key === offer.items[0]?.lookupKey,
    )!

    const discount = await this.resolveDiscount(offer)
    const availability = await this.resolveAvailability(offer)

    return {
      ...offer,
      availability: availability.kind,
      startDate: availability.startDate,
      price: this.formatPrice(price),
      discount: discount ?? undefined,
    }
  }

  private async resolveAvailability(
    offer: Offer,
  ): Promise<{ kind: OfferAvailability; startDate?: Date }> {
    const sub = await this.context.activeSubscription
    if (sub) {
      if (resolveUpgradePaths(sub).includes(offer.id)) {
        return { kind: 'UPGRADEABLE', startDate: sub.currentPeriodEnd }
      } else {
        return { kind: 'UNAVAILABLE' }
      }
    }
    return { kind: 'PURCHASABLE', startDate: new Date() }
  }

  private async resolveDiscount(
    offer: Offer,
  ): Promise<APIDiscountResult | null> {
    if (offer.fixedDiscount) {
      const promotion = await this.paymentService.getPromotion(
        offer.company,
        offer.fixedDiscount,
      )

      return promotion ? promotionToDiscount(promotion) : null
    }

    if (this.promoCode && offer.allowPromotions) {
      const promotion = await this.paymentService.getPromotion(
        offer.company,
        this.promoCode,
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
