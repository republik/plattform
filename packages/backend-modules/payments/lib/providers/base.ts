import { Company, Subscription } from '../types'

export class PaymentProviderRecord {
  #providers: Record<Company, PaymentProviderActions>

  constructor(providers: Record<Company, PaymentProviderActions>) {
    //TODO: make this a bit prettier
    this.#providers = providers
  }

  forCompany(company: Company): PaymentProviderActions {
    return this.#providers[company]
  }
}

export interface PaymentProviderActions {
  getCustomerSubscriptions(customerId: string): Promise<Subscription[]>
  createCustomer(email: string, userId: string): Promise<string>
  verifyWebhook<T>(req: any, secret: string): T
  createCustomerPortalSession(
    customerId: string,
    opts: { returnUrl: string; locale: 'auto' | 'de' | 'en' | 'fr' },
  ): Promise<string>
}
