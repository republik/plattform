import Stripe from 'stripe'
import { Company, Subscription } from './../types'
import { getConfig } from '../config'
import { PaymentProviderActions } from './base'

const config = getConfig()

export const ProjectRStripe = new Stripe(config.PROJECT_R_STRIPE_API_KEY, {
  // @ts-expect-error stripe-version-2020-08-27
  apiVersion: config.stripe_api_version,
})

export const RepublikAGStripe = new Stripe(config.REPUBLIK_STRIPE_API_KEY, {
  // @ts-expect-error stripe-version-2020-08-27
  apiVersion: config.stripe_api_version,
})

export class StripeProvider implements PaymentProviderActions {
  // @ts-expect-error company is unused
  #company: Company
  #stripe: Stripe

  constructor(company: Company, stripe: Stripe) {
    this.#company = company
    this.#stripe = stripe
  }
  async createCustomer(email: string, userId: string): Promise<string> {
    const customer = await this.#stripe.customers.create({
      name: email,
      email: email,
      metadata: {
        userId: userId,
      },
    })

    return customer.id
  }

  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    const stripeSubs = this.#stripe.subscriptions.list({
      customer: customerId,
    })

    console.log(stripeSubs)

    return []
  }

  async cancelSubscriptionAtPeriodEnd(subId: string): Promise<Subscription> {
    console.log(subId)
    return {} as Subscription
  }

  async createCustomerPortalSession(
    customerId: string,
    opts: { returnUrl: string; locale: 'auto' | 'de' | 'en' | 'fr' },
  ): Promise<string> {
    const sess = await this.#stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: opts.returnUrl,
      locale: opts.locale,
    })

    return sess.url
  }

  verifyWebhook(req: any, secret: string): any {
    const signature = req.headers['stripe-signature']

    return this.#stripe.webhooks.constructEvent(req.body, signature, secret)
  }
}
