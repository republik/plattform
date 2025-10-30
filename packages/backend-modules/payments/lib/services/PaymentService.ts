import Stripe from 'stripe'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
import { Company, PaymentMethod } from '../types'
import { LineItem } from '../shop/CheckoutSessionOptionBuilder'
import {
  REPUBLIK_PAYMENTS_INTERNAL_REF,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN,
} from '../constants'

type Discount = {
  coupon?: string
  discount?: string
  promo_code?: string
}

type Recurring = Stripe.PriceCreateParams.Recurring

export type Item =
  | {
      price: string
      price_data?: never
      quantity: number
      discounts?: Discount[]
    }
  | {
      price?: never
      price_data: {
        unit_amount: number
        product: string
        recurring: Recurring
        currency: 'CHF'
      }
      quantity: number
      discounts?: Discount[]
    }

export type OnetimeItem =
  | {
      price: string
      price_data?: never
      quantity: number
      discounts?: Discount[]
    }
  | {
      price?: never
      price_data: {
        unit_amount: number
        product: string
        currency: 'CHF'
      }
      quantity: number
      discounts?: Discount[]
    }

export type ScheduleSubscriptionArgs = {
  internalRef: string
  items: Item[]
  add_invoice_items?: LineItem[]
  collectionMethod: 'send_invoice' | 'charge_automatically'
  discounts: Stripe.SubscriptionScheduleCreateParams.Phase.Discount[]
  startDate: number
  metadata?: Record<string, string | number | null>
}

export class PaymentService {
  #stripeAdapters: Record<Company, Stripe> = {
    PROJECT_R: ProjectRStripe,
    REPUBLIK: RepublikAGStripe,
  }

  async createCustomer(company: Company, email: string, userId: string) {
    const customer = await this.#stripeAdapters[company].customers.create({
      email,
      metadata: {
        userId,
      },
    })

    return customer ? customer : null
  }

  async getCustomer(company: Company, id: string) {
    const customer = await this.#stripeAdapters[company].customers.retrieve(id)

    return customer ? customer : null
  }

  async updateCustomerEmail(
    company: Company,
    customerId: string,
    email: string,
  ) {
    return this.#stripeAdapters[company].customers.update(customerId, {
      email,
    })
  }

  async getPaymentMethod(company: Company, id: string) {
    const paymentMethod = await this.#stripeAdapters[
      company
    ].paymentMethods.retrieve(id)

    return paymentMethod ? paymentMethod : null
  }

  async getPaymentMethodForSubscription(
    company: Company,
    subscriptionExternalId: string,
  ): Promise<PaymentMethod | null | undefined> {
    const subscription = await this.getSubscription(
      company,
      subscriptionExternalId,
    )

    if (!subscription?.customer) {
      return null
    }

    const customer = await this.getCustomer(
      company,
      subscription.customer as string,
    )

    if (!customer || customer.deleted) {
      return null
    }

    const paymentMethodId =
      subscription.default_payment_method ||
      customer.invoice_settings.default_payment_method

    if (typeof paymentMethodId !== 'string') {
      return null
    }

    const paymentMethod = await this.getPaymentMethod(company, paymentMethodId)

    if (!paymentMethod) {
      return null
    }

    if (paymentMethod.card) {
      return {
        id: paymentMethodId,
        method: this.capitalize(paymentMethod.card.brand),
        last4: paymentMethod.card.last4,
      }
    }

    if (paymentMethod.paypal) {
      return {
        id: paymentMethodId,
        method: 'Paypal',
      }
    }

    if (paymentMethod.twint) {
      return {
        id: paymentMethodId,
        method: 'Twint',
      }
    }
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

  async deleteSubscription(company: Company, id: string) {
    return this.#stripeAdapters[company].subscriptions.cancel(id)
  }

  async listSubscriptionItems(company: Company, id: string) {
    return (
      await this.#stripeAdapters[company].subscriptionItems.list({
        subscription: id,
      })
    ).data
  }

  async getScheduledSubscriptionInvoicePreview(company: Company, id: string) {
    return this.#stripeAdapters[company].invoices.createPreview({
      schedule: id,
      expand: ['discounts'],
    })
  }

  async scheduleSubscription(
    company: Company,
    customerId: string,
    options: ScheduleSubscriptionArgs,
  ) {
    return this.#stripeAdapters[company].subscriptionSchedules.create({
      customer: customerId,
      start_date: options.startDate,
      end_behavior: 'release',
      phases: [
        {
          items: options.items,
          iterations: 1,
          add_invoice_items: options.add_invoice_items,
          discounts: options.discounts,
          collection_method: options.collectionMethod,
          metadata: {
            ...options.metadata,
            [REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN]: 'UPGRADE',
            [REPUBLIK_PAYMENTS_INTERNAL_REF]: options.internalRef,
          },
        },
      ],
    })
  }

  async cancelScheduleSubscription(company: Company, scheduleId: string) {
    return this.#stripeAdapters[company].subscriptionSchedules.cancel(
      scheduleId,
    )
  }

  async createSubscriptionItem(
    company: Company,
    params: Stripe.SubscriptionItemCreateParams,
  ) {
    return this.#stripeAdapters[company].subscriptionItems.create(params)
  }

  async updateSubscriptionItem(
    company: Company,
    itemId: string,
    params: Stripe.SubscriptionItemUpdateParams,
  ) {
    return this.#stripeAdapters[company].subscriptionItems.update(
      itemId,
      params,
    )
  }

  async deleteSubscriptionItem(company: Company, itemId: string) {
    return this.#stripeAdapters[company].subscriptionItems.del(itemId, {
      proration_behavior: 'none',
    })
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

  async getPrice(company: Company, id: string): Promise<Stripe.Price | null> {
    const price = await this.#stripeAdapters[company].prices.retrieve(id)

    return price
  }

  async getInvoice(company: Company, id: string) {
    const invoice = await this.#stripeAdapters[company].invoices.retrieve(id, {
      expand: [
        'discounts',
        'payments.data.payment.charge',
        'payments.data.payment.payment_intent',
      ],
    })

    return invoice ? invoice : null
  }

  async getInvoicePreview(company: Company, subId: string) {
    const invoice = await this.#stripeAdapters[company].invoices.createPreview({
      subscription: subId,
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

  async getCheckoutSession(company: Company, id: string) {
    const session = await this.#stripeAdapters[
      company
    ].checkout.sessions.retrieve(id, {
      expand: ['line_items', 'line_items.data.price.product'],
    })

    return session ? session : null
  }

  async createCustomerPortalSession(
    company: Company,
    customerId: string,
    opts: {
      returnUrl: string
      locale: 'auto' | 'de' | 'en' | 'fr'
    },
  ): Promise<string> {
    const args: Stripe.BillingPortal.SessionCreateParams = {
      customer: customerId,
      return_url: opts.returnUrl,
      locale: opts.locale,
      flow_data: {
        type: 'payment_method_update',
      },
    }

    const sess = await this.#stripeAdapters[
      company
    ].billingPortal.sessions.create(args)

    return sess.url
  }

  verifyWebhook(company: Company, req: any, secret: string): Stripe.Event {
    const signature = req.headers['stripe-signature']

    return this.#stripeAdapters[company].webhooks.constructEvent(
      req.body,
      signature,
      secret,
    )
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
