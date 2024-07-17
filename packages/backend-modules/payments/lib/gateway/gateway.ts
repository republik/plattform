import { Company, Subscription } from './../types'
import Stripe from 'stripe'
import { PaymentGatwayActions } from './type'
import { getConfig } from '../config'

export class PaymentGateway {
  #gateways: Record<Company, PaymentGatwayActions>

  constructor(gateways: Record<Company, Stripe>) {
    const confg = getConfig()

    //TODO: make this a bit prettier
    this.#gateways = {
      PROJECT_R: new StripeGatewayActions(
        'PROJECT_R',
        gateways.PROJECT_R,
        confg.PROJECT_R_STRIPE_ENDPOINT_SECRET,
      ),
      REPUBLIK_AG: new StripeGatewayActions(
        'REPUBLIK_AG',
        gateways.REPUBLIK_AG,
        confg.REPUBLIK_STRIPE_ENDPOINT_SECRET,
      ),
    }
  }

  forCompany(company: Company): PaymentGatwayActions {
    return this.#gateways[company]
  }
}

class StripeGatewayActions implements PaymentGatwayActions {
  // @ts-expect-error company might be used later
  #company: Company
  #stripe: Stripe
  #webhookSecret: string

  constructor(company: Company, stripe: Stripe, webhookSecret: string) {
    this.#company = company
    this.#stripe = stripe
    this.#webhookSecret = webhookSecret
  }
  async createCustomer(email: string, userId: string): Promise<string> {
    const customer = await this.#stripe.customers.create({
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

  verifyWebhook(req: any): any {
    const signature = req.headers['stripe-signature']

    return this.#stripe.webhooks.constructEvent(
      req.body,
      signature,
      this.#webhookSecret,
    )
  }
}
