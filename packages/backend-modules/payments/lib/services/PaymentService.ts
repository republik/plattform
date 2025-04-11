import Stripe from 'stripe'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
import { Company } from '../types'

export class PaymentService {
  #stripeAdapters: Record<Company, Stripe> = {
    PROJECT_R: ProjectRStripe,
    REPUBLIK: RepublikAGStripe,
  }

  async getSubscription(company: Company, id: string) {
    const sub = await this.#stripeAdapters[company].subscriptions.retrieve(id)

    return sub ? sub : null
  }

  async updateSubscription(
    company: Company,
    id: string,
    opts: Stripe.SubscriptionUpdateParams,
  ) {
    return this.#stripeAdapters[company].subscriptions.update(id, opts)
  }

  async getPromotion(
    company: Company,
    promoCode: string,
  ): Promise<Stripe.PromotionCode | null> {
    const promotion = await this.#stripeAdapters[company].promotionCodes.list({
      active: true,
      code: promoCode,
      limit: 1,
    })

    return promotion.data.length === 1 ? promotion.data[0] : null
  }

  async getCoupon(
    company: Company,
    couponId: string,
  ): Promise<Stripe.Coupon | null> {
    const coupon = await this.#stripeAdapters[company].coupons.retrieve(
      couponId,
    )

    return coupon ? coupon : null
  }

  async getPrices(
    company: Company,
    lookupKeys: string[],
  ): Promise<Stripe.Price[]> {
    const prices = await this.#stripeAdapters[company].prices.list({
      active: true,
      lookup_keys: lookupKeys,
      expand: ['data.product'],
    })

    return prices.data
  }

  async getInvoice(company: Company, id: string) {
    const invoice = await this.#stripeAdapters[company].invoices.retrieve(id, {
      expand: ['discounts', 'charge'],
    })

    return invoice ? invoice : null
  }

  async getCharge(company: Company, id: string) {
    const charge = await this.#stripeAdapters[company].charges.retrieve(id)

    return charge ? charge : null
  }

  async createCheckoutSession(
    company: Company,
    config: Stripe.Checkout.SessionCreateParams,
  ) {
    return this.#stripeAdapters[company].checkout.sessions.create(config)
  }
}
