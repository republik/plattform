import { Company, Subscription } from './../types'
import Stripe from 'stripe'
import { CustomerRepo } from '../database/repo'
import { PaymentGatwayActions } from './type'
import { getConfig } from '../config'

export class PaymentGateway {
  #gateways: Record<Company, PaymentGatwayActions>

  constructor(gateways: Record<Company, Stripe>, customerRepo: CustomerRepo) {
    const confg = getConfig()

    //TODO: make this a bit prettier
    this.#gateways = {
      project_r: new StripeGatewayActions(
        'project_r',
        customerRepo,
        gateways.project_r,
        confg.project_r_stripe_endpoint_secret,
      ),
      republik_ag: new StripeGatewayActions(
        'republik_ag',
        customerRepo,
        gateways.project_r,
        confg.republik_stripe_endpoint_secret,
      ),
    }
  }

  forCompany(company: Company): PaymentGatwayActions {
    return this.#gateways[company]
  }
}

class StripeGatewayActions implements PaymentGatwayActions {
  #company: Company
  #customerRepo: CustomerRepo
  #stripe: Stripe
  #webhookSecret: string

  constructor(
    company: Company,
    customerRepo: CustomerRepo,
    stripe: Stripe,
    webhookSecret: string,
  ) {
    this.#company = company
    this.#stripe = stripe
    this.#customerRepo = customerRepo
    this.#webhookSecret = webhookSecret
  }
  async createCustomer(email: string, userId: string): Promise<string> {
    const customer = await this.#stripe.customers.create({
      email: email,
      metadata: {
        userId: userId,
      },
    })

    await this.#customerRepo.saveCustomerIdForCompany(
      userId,
      this.#company,
      customer.id,
    )

    return customer.id
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const customerId = await this.#customerRepo.getCustomerIdForCompany(
      userId,
      this.#company,
    )

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
