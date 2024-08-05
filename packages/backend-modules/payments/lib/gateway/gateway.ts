import { Company, Subscription } from './../types'
import Stripe from 'stripe'
import { PaymentGatwayActions } from './type'

export class PaymentGateway {
  #gateways: Record<Company, PaymentGatwayActions>

  constructor(gateways: Record<Company, Stripe>) {
    //TODO: make this a bit prettier
    this.#gateways = {
      PROJECT_R: new StripeGatewayActions('PROJECT_R', gateways.PROJECT_R),
      REPUBLIK_AG: new StripeGatewayActions(
        'REPUBLIK_AG',
        gateways.REPUBLIK_AG,
      ),
    }
  }

  forCompany(company: Company): PaymentGatwayActions {
    return this.#gateways[company]
  }
}

class StripeGatewayActions implements PaymentGatwayActions {
  // @ts-expect-error company is unused
  #company: Company
  #stripe: Stripe

  constructor(company: Company, stripe: Stripe) {
    this.#company = company
    this.#stripe = stripe
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

  verifyWebhook(req: any, secret: string): any {
    const signature = req.headers['stripe-signature']

    return this.#stripe.webhooks.constructEvent(req.body, signature, secret)
  }
}
