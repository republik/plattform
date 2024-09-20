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

  async getSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription | null> {
    const sub = await this.#stripe.subscriptions.retrieve(subscriptionId)

    if (!sub) {
      return null
    }

    return sub
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    const invoice = await this.#stripe.invoices.retrieve(invoiceId, {
      expand: ['discounts'],
    })

    if (!invoice) {
      return null
    }

    return invoice
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

  async updateCustomerEmail(
    customerId: string,
    email: string,
  ): Promise<Stripe.Customer | null> {
    const customer = await this.#stripe.customers.update(customerId, {
      name: email,
      email: email,
    })

    if (!customer) {
      return null
    }

    return customer
  }

  async getPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod | null> {
    const pm = await this.#stripe.paymentMethods.retrieve(paymentMethodId)

    return pm
  }

  async getCustomerSubscriptions(
    customerId: string,
  ): Promise<Stripe.Subscription[]> {
    const stripeSubs = this.#stripe.subscriptions.list({
      customer: customerId,
    })

    console.log(stripeSubs)

    return []
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    const cus = await this.#stripe.customers.retrieve(customerId)

    if (cus.deleted) {
      return null
    }

    return cus
  }

  async cancelSubscriptionAtPeriodEnd(subId: string): Promise<Subscription> {
    console.log(subId)
    return {} as Subscription
  }

  async createCustomerPortalSession(
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
    }

    const sess = await this.#stripe.billingPortal.sessions.create(args)

    return sess.url
  }

  verifyWebhook(req: any, secret: string): any {
    const signature = req.headers['stripe-signature']

    return this.#stripe.webhooks.constructEvent(req.body, signature, secret)
  }
}
