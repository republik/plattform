import Stripe from 'stripe'
import { PaymentService } from '../services/PaymentService'
import { resolveUpgradePaths } from './offers'
import { PgDb } from 'pogi'
import { SubscriptionService } from '../services/SubscriptionService'
import {
  APIDiscountResult,
  Offer,
  OfferAPIResult,
  OfferAvailability,
  Subscription,
} from '../types'
import { UpgradeService } from '../services/UpgradeService'
import { Logger } from '@orbiting/backend-modules-types'
import { promotionToDiscount } from './utils'

export class OfferBuilder {
  private paymentService: PaymentService
  private subscriptionService: SubscriptionService
  private upgradeService: UpgradeService
  private offers: Offer[]
  private promoCode?: string
  private priceData?: Stripe.Price[]
  private context: {
    userId?: string
    activeSubscription?: Promise<Subscription | null>
    hasUnresolvedUpgrades?: Promise<boolean | null>
  }

  constructor(
    paymentService: PaymentService,
    pgdb: PgDb,
    offer: Offer | Offer[],
    logger: Logger,
  ) {
    this.paymentService = paymentService
    this.subscriptionService = new SubscriptionService(pgdb)
    this.upgradeService = new UpgradeService(pgdb, logger)
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
          'past_due',
          'unpaid',
        ])

        return subs[0]
      })()
      this.context.hasUnresolvedUpgrades = (async () => {
        return await this.upgradeService.hasUnresolvedUpgrades({
          user_id: userId,
        })
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
    const hasUnresolvedUpgreads = await this.context.hasUnresolvedUpgrades
    if (offer.id.startsWith('GIFT')) return { kind: 'PURCHASABLE' }

    if (sub) {
      if (resolveUpgradePaths(sub).includes(offer.id)) {
        if (hasUnresolvedUpgreads && offer.id !== 'DONATION') {
          return { kind: 'UNAVAILABLE_UPGRADE_PENDING' }
        }

        return { kind: 'UPGRADEABLE', startDate: sub.currentPeriodEnd }
      } else {
        const [offerType] = offer.id.split('_')
        const [supType] = sub.type.split('_')

        if (offerType === supType) return { kind: 'UNAVAILABLE_CURRENT' }

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
