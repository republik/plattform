import { User } from '@orbiting/backend-modules-types'
import { Logger } from '@orbiting/backend-modules-logger'
import {
  Offer,
  activeOffers,
  ComplimentaryItem,
  Discount,
  couponToDiscount,
  promotionToDiscount,
  DiscountOption,
  OfferType,
} from '.'
import { Company } from '../types'
import Stripe from 'stripe'
import { getConfig } from '../config'
import { PaymentService } from '../services/PaymentService'
import { CustomerInfoService } from '../services/CustomerInfoService'

export type Price = {
  price: string
  quantity: number
  tax_rates?: string[]
}

export type PriceData = {
  price_data: {
    unit_amount: number
    product: string
    currency: 'CHF'
  }
  quantity: number
  tax_rates?: string[]
}

export type RecurringPriceData = {
  price_data: {
    unit_amount: number
    product: string
    currency: 'CHF'
    recurring: Stripe.PriceCreateParams.Recurring
  }
  quantity: number
  tax_rates?: string[]
}

export type CustomDonation = { amount: number; recurring?: boolean }

export type LineItem = Price | PriceData | RecurringPriceData

export class CheckoutSessionBuilder {
  private offer: Offer
  private paymentService: PaymentService
  private customerInfoService: CustomerInfoService
  private uiMode: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
  private optionalSessionVars: {
    complimentaryItems?: any[]
    promoCode?: string
    customerId: Promise<string | undefined>
    metadata?: Record<string, string>
    couponMetadata: Promise<Stripe.Metadata | undefined>
    selectedDiscount: Promise<{ type: 'DISCOUNT'; value: Discount } | undefined>
    returnURL?: string
    selectedDonation?: CustomDonation
  }

  constructor(
    offerId: string,
    paymentService: PaymentService,
    CustomerInfoService: CustomerInfoService,
    logger: Logger,
  ) {
    const offer = activeOffers().find((o) => o.id === offerId)
    if (!offer) throw new Error('api/shop/unknown/offer')

    logger.info(offer, 'creating CheckoutSessionBuilder')

    this.offer = offer
    this.paymentService = paymentService
    this.customerInfoService = CustomerInfoService
    this.uiMode = 'EMBEDDED'
    this.optionalSessionVars = {
      customerId: (async () => undefined)(),
      couponMetadata: (async () => undefined)(),
      selectedDiscount: (async () => undefined)(),
    }
  }

  public withPromoCode(code?: string): this {
    if (code) {
      this.optionalSessionVars.couponMetadata = (async () => {
        const promo = await this.paymentService.getPromotion(
          this.offer.company,
          code,
        )
        if (promo) {
          return promo.coupon.metadata || {}
        }
        return undefined
      })()
      this.optionalSessionVars.promoCode = code
    }
    return this
  }

  public withSelectedDiscount(id?: string): this {
    if (id && this.offer.discountOpitions?.find((d) => d.coupon === id)) {
      this.optionalSessionVars.selectedDiscount = (async () => {
        const coupon = await this.paymentService.getCoupon(
          this.offer.company,
          id,
        )
        return coupon
          ? { type: 'DISCOUNT', value: couponToDiscount(coupon) }
          : undefined
      })()
    }
    return this
  }

  public withUIMode(uiMode?: 'HOSTED' | 'CUSTOM' | 'EMBEDDED') {
    if (uiMode) {
      this.uiMode = uiMode
    }
    return this
  }

  public withCustomer(user?: User): this {
    if (this.offer.requiresLogin && !user) {
      throw new Error('api/signIn')
    }
    this.optionalSessionVars.customerId = (async () => {
      return await this.getCustomer(this.offer.company, user?.id)
    })()
    return this
  }

  public withDonation(donation: { amount: number } | undefined): this {
    if (this.offer.company === 'PROJECT_R') {
      this.optionalSessionVars.selectedDonation = donation
    }
    return this
  }

  public withMetadata(metadata?: Record<string, any> | any): this {
    if (metadata) {
      this.optionalSessionVars.metadata = metadata
    }
    return this
  }

  public withComplementaryItems(items: ComplimentaryItem[]): this {
    this.optionalSessionVars.complimentaryItems = items
    return this
  }

  public withReturnURL(url?: string): this {
    this.optionalSessionVars.returnURL = url
    return this
  }

  async build(): Promise<{
    company: Company
    sessionId: string | null
    clientSecret: string | null
    url: string | null
  }> {
    const { customerId, metadata } = this.optionalSessionVars

    const [lineItems, donationLineItems, discount, couponMeta] =
      await Promise.all([
        this.genLineItems(),
        this.genDonationLineItems(),
        this.resolveDiscount(),
        this.resolveCouponMetadata(),
      ])

    const allLineItems = [...lineItems, ...donationLineItems]

    const mergedMetadata = {
      ...metadata,
      ...this.offer.metaData,
      ...couponMeta,
    }

    const config: Stripe.Checkout.SessionCreateParams = {
      ...this.checkoutUIConfig(),
      mode: this.getCheckoutMode(),
      customer: await customerId,
      line_items: allLineItems,
      currency: 'CHF',
      discounts: discount ? [this.formatDiscount(discount)] : undefined,
      locale: 'de',
      shipping_address_collection: this.getShippingAddressCollection(),
      payment_method_configuration: this.getPaymentConfigId(),
      metadata: mergedMetadata,
      subscription_data:
        this.offer.type === 'SUBSCRIPTION'
          ? { metadata: mergedMetadata }
          : undefined,
      consent_collection: { terms_of_service: 'required' },
    }

    const sess = await this.paymentService.createCheckoutSession(
      this.offer.company,
      config,
    )

    return {
      company: this.offer.company,
      sessionId: sess.id,
      clientSecret: sess.client_secret,
      url: sess.url,
    }
  }

  private async resolveCouponMetadata(): Promise<Record<string, string>> {
    const metadata: Record<string, string> = {}
    const resolvedCouponMetadata = await this.optionalSessionVars.couponMetadata
    if (resolvedCouponMetadata) {
      Object.keys(resolvedCouponMetadata).forEach((key) => {
        metadata[`coupon_${key}`] = resolvedCouponMetadata[key]
      })
    }
    return metadata
  }

  private getCheckoutMode(): 'payment' | 'subscription' {
    return this.offer.type === 'SUBSCRIPTION' ? 'subscription' : 'payment'
  }

  async resolveDiscount(): Promise<DiscountOption | null> {
    const { promoCode, selectedDiscount } = this.optionalSessionVars

    if (this.offer.fixedDiscount) {
      const promotion = await this.paymentService.getPromotion(
        this.offer.company,
        this.offer.fixedDiscount,
      )

      if (promotion) {
        return { type: 'DISCOUNT', value: couponToDiscount(promotion.coupon) }
      }
    }

    const resolvedSelectedDiscount = await selectedDiscount
    if (resolvedSelectedDiscount) {
      return resolvedSelectedDiscount
    }

    if (promoCode && this.offer.allowPromotions) {
      const promotion = await this.paymentService.getPromotion(
        this.offer.company,
        promoCode,
      )
      if (promotion)
        return { type: 'PROMO', value: promotionToDiscount(promotion) }
    }

    return null
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

  private async genLineItems(): Promise<LineItem[]> {
    if (this.offer.items.length === 0) {
      return []
    }

    const prices = await this.paymentService.getPrices(
      this.offer.company,
      this.offer.items.map((i) => i.lookupKey),
    )

    return prices.map((p): LineItem => {
      const item = this.offer.items.find((i) => i.lookupKey === p.lookup_key)
      const taxRates = item?.taxRateId ? [item.taxRateId] : undefined

      if (p.id) {
        return {
          price: p.id,
          quantity: 1,
          tax_rates: taxRates,
        }
      }

      return {
        price_data: {
          unit_amount: p.unit_amount ?? 0,
          product: p.product.toString(),
          currency: 'CHF',
          recurring: {
            interval: 'year',
            interval_count: 1,
          },
        },
        quantity: 1,
        tax_rates: taxRates,
      }
    })
  }

  private async genDonationLineItems(): Promise<LineItem[]> {
    const { selectedDonation } = this.optionalSessionVars

    const lineItems: LineItem[] = []

    if (
      typeof this.offer.suggestedDonations !== 'undefined' &&
      selectedDonation
    ) {
      const donation = makeDonation(this.offer.type, selectedDonation)

      lineItems.push(donation)
    }

    return lineItems
  }

  private formatDiscount(
    discount: DiscountOption,
  ): { coupon: string } | { promotion_code: string } {
    if (discount.type === 'DISCOUNT') {
      return { coupon: discount.value.id }
    }
    if (discount.type === 'PROMO') {
      return { promotion_code: discount.value.id }
    }
    throw new Error('api/shop/unexpectedDiscount')
  }

  private getShippingAddressCollection():
    | { allowed_countries: ['CH'] }
    | undefined {
    return this.optionalSessionVars.complimentaryItems?.length
      ? { allowed_countries: ['CH'] }
      : undefined
  }

  private checkoutUIConfig() {
    const returnURL =
      this.optionalSessionVars.returnURL ||
      `${getConfig().SHOP_BASE_URL}/angebot/${
        this.offer.id
      }?session_id={CHECKOUT_SESSION_ID}`

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
          cancel_url: `${getConfig().SHOP_BASE_URL}/angebot/${this.offer.id}`,
        }
      default:
        this.uiMode satisfies never
    }
  }
  private getPaymentConfigId() {
    switch (this.offer.company) {
      case 'PROJECT_R':
        return getConfig().PROJECT_R_STRIPE_PAYMENTS_CONFIG_ID
      case 'REPUBLIK':
        return getConfig().REPUBLIK_STRIPE_PAYMENTS_CONFIG_ID
    }
  }
}

function makeDonation(
  offerType: 'SUBSCRIPTION',
  donation: CustomDonation,
): RecurringPriceData | PriceData
function makeDonation(
  offerType: 'ONETIME_PAYMENT',
  donation: CustomDonation,
): PriceData
function makeDonation(
  offerType: OfferType,
  donation: CustomDonation,
): RecurringPriceData | PriceData
function makeDonation(
  offerType: OfferType,
  donation: CustomDonation,
): RecurringPriceData | PriceData {
  switch (offerType) {
    case 'SUBSCRIPTION':
      return {
        price_data: {
          unit_amount: donation.amount,
          currency: 'CHF',
          product: getConfig().PROJECT_R_DONATION_PRODUCT_ID,
          recurring: donation.recurring
            ? {
                interval: 'year',
                interval_count: 1,
              }
            : undefined,
        },
        quantity: 1,
      }
    case 'ONETIME_PAYMENT':
      return {
        price_data: {
          unit_amount: donation.amount,
          currency: 'CHF',
          product: getConfig().PROJECT_R_DONATION_PRODUCT_ID,
        },
        quantity: 1,
      }
    default:
      offerType satisfies never
      throw new Error('invalid offer type')
  }
}
