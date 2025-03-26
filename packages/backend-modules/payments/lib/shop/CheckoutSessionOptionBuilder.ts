import { User } from '@orbiting/backend-modules-types'
import {
  Offer,
  activeOffers,
  isPromoCodeInBlocklist,
  ComplimentaryItem,
} from '.'
import { Payments } from '../payments'
import { Company } from '../types'

export async function getCustomer(company: Company, userId?: string) {
  if (!userId) {
    return undefined
  }

  const customerId = (
    await Payments.getInstance().getCustomerIdForCompany(userId, company)
  )?.customerId

  if (customerId) {
    return customerId
  }

  return await Payments.getInstance().createCustomer(company, userId)
}

export class CheckoutSessionOptionBuilder {
  private offer: Offer
  uiMode: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
  private optionalSessionVars: {
    complimentaryItems?: any[]
    promoCode?: string
    customerId?: string
    metadata?: any
    returnURL?: string
    applyEntryOffer?: boolean
    selectedDonation?: string | { amount: number }
  }

  constructor(offerId: string, uiMode?: 'HOSTED' | 'CUSTOM' | 'EMBEDDED') {
    const offer = activeOffers().find((o) => o.id === offerId)
    if (!offer) throw new Error('api/shop/unknown/offer')

    this.offer = offer
    this.uiMode = uiMode || 'EMBEDDED'
    this.optionalSessionVars = {}
  }

  public withPromoCode(code?: string): this {
    if (code && !isPromoCodeInBlocklist(code)) {
      this.optionalSessionVars.promoCode = code
    }
    return this
  }

  public async withCustomer(user?: User): Promise<this> {
    if (this.offer.requiresLogin && !user) {
      throw new Error('api/signIn')
    }

    this.optionalSessionVars.customerId = await getCustomer(
      this.offer.company,
      user?.id,
    )
    return this
  }

  public withDonation(donation: string | { amount: number } | undefined): this {
    if (this.offer.company === 'PROJECT_R') {
      this.optionalSessionVars.selectedDonation = donation
    }
    return this
  }

  public withMetadata(metadata?: Record<string, any> | any) {
    if (metadata) {
      this.optionalSessionVars.metadata = metadata
    }

    return this
  }

  public withComplementaryItems(items: ComplimentaryItem[]) {
    this.optionalSessionVars.complimentaryItems = items

    return this
  }

  public withEntryOffer(bool: boolean): this {
    if (this.offer.allowIntroductoryOffer) {
      this.optionalSessionVars.applyEntryOffer = bool
    }

    return this
  }

  public withReturnURL(url?: string): this {
    this.optionalSessionVars.returnURL = url
    return this
  }

  public build() {
    return {
      offer: this.offer,
      uiMode: this.uiMode,
      ...this.optionalSessionVars,
    }
  }
}
