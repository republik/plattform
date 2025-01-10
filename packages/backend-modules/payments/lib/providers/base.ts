import Stripe from 'stripe'
import { Company } from '../types'

export class PaymentProviderRecord {
  #providers: Record<Company, PaymentProviderActions>

  constructor(providers: Record<Company, PaymentProviderActions>) {
    this.#providers = providers
  }

  forCompany(company: Company): PaymentProviderActions {
    return this.#providers[company]
  }
}

export interface PaymentProviderActions {
  getCustomer(customerId: string): Promise<Stripe.Customer | null>
  updateCustomerEmail(
    customerId: string,
    email: string,
  ): Promise<Stripe.Customer | null>
  getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]>
  getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null>
  getInvoice(invoiceId: string): Promise<Stripe.Invoice | null>
  getCharge(chargeId: string): Promise<Stripe.Charge | null>
  createCustomer(email: string, userId: string): Promise<string>
  getPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod | null>
  verifyWebhook<T>(req: any, secret: string): T
  createCustomerPortalSession(
    customerId: string,
    opts: {
      returnUrl: string
      locale: 'auto' | 'de' | 'en' | 'fr'
    },
  ): Promise<string>
  getCheckoutSession(id: string): Promise<Stripe.Checkout.Session | null>
}
