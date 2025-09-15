import Stripe from 'stripe'
import { Company } from '../types'
import { User } from '@orbiting/backend-modules-types'
import { PaymentService } from '../services/PaymentService'
import { CustomerInfoService } from '../services/CustomerInfoService'
import { Logger } from '../../../logger/build/@types'
import { getConfig } from '../config'

export class SetupSessionBuilder {
  private company: Company
  private paymentService: PaymentService
  private customerInfoService: CustomerInfoService
  private customerId: Promise<string | undefined>
  private uiMode: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
  private optionalSessionVars: {
    returnURL?: string
  }

  constructor(
    company: Company,
    paymentService: PaymentService,
    customerInfoService: CustomerInfoService,
    _logger: Logger,
  ) {
    this.company = company
    this.paymentService = paymentService
    this.customerInfoService = customerInfoService
    this.customerId = new Promise((res, _rej) => res('no customer selected'))
    this.uiMode = 'EMBEDDED'
    this.optionalSessionVars = {}
  }

  withCustomer(user?: User): this {
    this.customerId = (async () => {
      return await this.getCustomer(this.company, user?.id)
    })()
    return this
  }

  async build(): Promise<{
    company: Company
    sessionId: string | null
    clientSecret: string | null
    url: string | null
  }> {
    const config: Stripe.Checkout.SessionCreateParams = {
      ...this.checkoutUIConfig(),
      mode: 'setup',
      currency: 'CHF',
      customer: await this.customerId,
      // consent_collection: { terms_of_service: 'required' },
    }

    const sess = await this.paymentService.createCheckoutSession(
      this.company,
      config,
    )

    return {
      company: this.company,
      sessionId: sess.id,
      clientSecret: sess.client_secret,
      url: sess.url,
    }
  }

  public withReturnURL(url?: string): this {
    this.optionalSessionVars.returnURL = url
    return this
  }

  public withUIMode(uiMode?: 'HOSTED' | 'CUSTOM' | 'EMBEDDED') {
    if (uiMode) {
      this.uiMode = uiMode
    }
    return this
  }

  private async getCustomer(company: Company, userId?: string) {
    if (!userId) {
      return undefined
    }

    const customerId = (
      await this.customerInfoService.getCustomerIdForCompany(userId, company)
    )?.customerId

    if (customerId) {
      return customerId
    }

    return await this.customerInfoService.createCustomer(company, userId)
  }

  private checkoutUIConfig() {
    const returnURL =
      this.optionalSessionVars.returnURL || getConfig().SHOP_BASE_URL

    switch (this.uiMode) {
      case 'EMBEDDED':
        return {
          ui_mode: 'embedded' as Stripe.Checkout.SessionCreateParams.UiMode,
          return_url: returnURL,
          redirect_on_completion:
            'if_required' as Stripe.Checkout.SessionCreateParams.RedirectOnCompletion,
        }
      case 'CUSTOM':
        return {
          ui_mode: 'custom' as Stripe.Checkout.SessionCreateParams.UiMode,
          return_url: returnURL,
        }
      case 'HOSTED':
        return {
          ui_mode: 'hosted' as Stripe.Checkout.SessionCreateParams.UiMode,
          success_url: returnURL,
          cancel_url: returnURL,
        }
      default:
        this.uiMode satisfies never
    }
  }
}
