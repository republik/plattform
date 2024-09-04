import Stripe from 'stripe'
import { Company, Subscription } from '../types'
import { StripeProviderActions } from './stripe'

export class PaymentProvider {
  #gateways: Record<Company, PaymentProviderActions>

  constructor(gateways: Record<Company, Stripe>) {
    //TODO: make this a bit prettier
    this.#gateways = {
      PROJECT_R: new StripeProviderActions('PROJECT_R', gateways.PROJECT_R),
      REPUBLIK: new StripeProviderActions('REPUBLIK', gateways.REPUBLIK),
    }
  }

  forCompany(company: Company): PaymentProviderActions {
    return this.#gateways[company]
  }
}

export interface PaymentProviderActions {
  getCustomerSubscriptions(customerId: string): Promise<Subscription[]>
  createCustomer(email: string, userId: string): Promise<string>
  verifyWebhook<T>(req: any, secret: string): T
  createCustomerPortalSession(
    customerId: string,
    opts: object,
  ): Promise<Stripe.Response<Stripe.BillingPortal.Session>>
}
