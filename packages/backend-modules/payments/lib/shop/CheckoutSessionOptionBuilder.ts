import { User } from '@orbiting/backend-modules-types'
import { Logger } from '@orbiting/backend-modules-logger'
import {
  Company,
  ComplimentaryItem,
  Discount,
  DiscountOption,
  Offer,
  OfferAvailability,
  OfferType,
} from '../types'
import Stripe from 'stripe'
import { getConfig } from '../config'
import { PaymentService } from '../services/PaymentService'
import { CustomerInfoService } from '../services/CustomerInfoService'
import { Subscription } from '../types'
import { SubscriptionService } from '../services/SubscriptionService'
import { UpgradeService } from '../services/UpgradeService'
import { couponToDiscount, promotionToDiscount } from './utils'
import { randomUUID } from 'node:crypto'
import { InvoiceService } from '../services/InvoiceService'
import {
  REPUBLIK_PAYMENTS_INTERNAL_REF as INTERNAL_REF,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN as SUBSCRIPTION_ORIGIN,
  REPUBLIK_PAYMENTS_SUBSCRIPTION_ORIGIN_TYPE_UPGRADE as ORIGIN_UPGRADE,
} from '../constants'
import { OfferService } from '../services/OfferService'

export type SetupConfig = {
  company: Company
  mode: 'SETUP'
  requiresLogin: true
}
export type OfferConfig = Offer | SetupConfig

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

export type CheckoutResult = {
  orderId: string
  company: Company
  sessionId: string | null
  clientSecret: string | null
  url: string | null
}

export type CustomDonation = { amount: number; recurring?: boolean }

export type LineItem = Price | PriceData | RecurringPriceData

export class CheckoutSessionBuilder {
  private offer: Offer
  private offerService: OfferService
  private paymentService: PaymentService
  private customerInfoService: CustomerInfoService
  private subscriptionService: SubscriptionService
  private upgreadeService: UpgradeService
  private invoiceService: InvoiceService
  private uiMode: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
  private optionalSessionVars: {
    complimentaryItems?: any[]
    promoCode?: string
    userId?: string
    customerId: Promise<string | undefined>
    metadata?: Record<string, string>
    couponMetadata: Promise<
      { discountName: string | null; metadata: Stripe.Metadata } | undefined
    >
    selectedDiscount: Promise<{ type: 'DISCOUNT'; value: Discount } | undefined>
    returnURL?: string
    selectedDonation?: CustomDonation
    activeSubscription?: Subscription | null
  }

  constructor(
    offerId: string,
    offerService: OfferService,
    paymentService: PaymentService,
    customerInfoService: CustomerInfoService,
    subscriptionService: SubscriptionService,
    upgreadeService: UpgradeService,
    invoiceService: InvoiceService,
    logger: Logger,
  ) {
    this.offerService = offerService
    this.paymentService = paymentService
    this.customerInfoService = customerInfoService
    this.subscriptionService = subscriptionService
    this.upgreadeService = upgreadeService
    this.invoiceService = invoiceService
    this.uiMode = 'EMBEDDED'
    this.optionalSessionVars = {
      customerId: (async () => undefined)(),
      couponMetadata: (async () => undefined)(),
      selectedDiscount: (async () => undefined)(),
    }

    this.offerService.isValidOffer(offerId)
    this.offer = this.offerService.getOffer(offerId)

    logger.info({ offer: this.offer }, 'creating CheckoutSessionBuilder')
  }

  public withPromoCode(code?: string): this {
    if (code) {
      this.optionalSessionVars.couponMetadata = (async () => {
        const promo = await this.paymentService.getPromotion(
          this.offer.company,
          code,
        )
        if (promo) {
          return {
            discountName: promo.coupon.name,
            metadata: promo.coupon.metadata || {},
          }
        }
        return undefined
      })()
      this.optionalSessionVars.promoCode = code
    }
    return this
  }

  public withSelectedDiscount(id?: string): this {
    if (id && this.offer.discountOptions?.find((d) => d.coupon === id)) {
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
    this.optionalSessionVars.userId = user?.id
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

  async build(): Promise<CheckoutResult> {
    const orderId = randomUUID()

    const { customerId, metadata } = this.optionalSessionVars

    const availability = await this.checkAvailability()
    if (availability === 'UPGRADEABLE') {
      return this.buildSetupSession(orderId)
    }

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
      'republik:payments:order:id': orderId,
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
      consent_collection:
        this.uiMode !== 'CUSTOM' ? { terms_of_service: 'required' } : undefined,
    }

    const sess = await this.paymentService.createCheckoutSession(
      this.offer.company,
      config,
    )

    await this.saveOrder({
      checkoutId: orderId,
      sess,
      lineItems: sess.line_items?.data ?? [],
      mergedMetadata,
    })

    return {
      orderId: orderId,
      company: this.offer.company,
      sessionId: sess.id,
      clientSecret: sess.client_secret,
      url: sess.url,
    }
  }

  async buildSetupSession(checkoutId: string): Promise<CheckoutResult> {
    const { customerId, metadata, activeSubscription } =
      this.optionalSessionVars

    if (!customerId || !activeSubscription) {
      throw Error('Can not inilazie session')
    }

    const [discount, couponMeta] = await Promise.all([
      this.resolveDiscount(),
      this.resolveCouponMetadata(),
    ])

    const mergedMetadata: Record<string, string | number | null> = {
      ...metadata,
      ...this.offer.metaData,
      ...couponMeta,
      [SUBSCRIPTION_ORIGIN]: ORIGIN_UPGRADE,
      'republik:payments:order:id': checkoutId,
    }

    const upgradeRef = await this.upgreadeService.initializeSubscriptionUpgrade(
      this.optionalSessionVars.userId!,
      activeSubscription.id,
      {
        offerId: this.offer.id,
        discount: discount ?? undefined,
        donation: this.optionalSessionVars.selectedDonation,
        metadata: mergedMetadata,
      },
    )

    mergedMetadata[INTERNAL_REF] = upgradeRef.id

    const config: Stripe.Checkout.SessionCreateParams = {
      ...this.checkoutUIConfig(),
      mode: 'setup',
      currency: 'CHF',
      locale: 'de',
      customer: await customerId,
      metadata: mergedMetadata,
      consent_collection:
        this.uiMode !== 'CUSTOM' ? { terms_of_service: 'required' } : undefined,
    }

    const sess = await this.paymentService.createCheckoutSession(
      this.offer.company,
      config,
    )

    await this.saveOrder({
      checkoutId,
      sess,
      lineItems: [],
      mergedMetadata,
    })

    return {
      orderId: checkoutId,
      company: this.offer.company,
      sessionId: sess.id,
      clientSecret: sess.client_secret,
      url: sess.url,
    }
  }

  private async checkAvailability(): Promise<OfferAvailability> {
    const userId = this.optionalSessionVars.userId
    if (userId) {
      const sub = (
        await this.subscriptionService.listSubscriptions(userId, ['active'])
      )[0]

      this.optionalSessionVars.activeSubscription = sub

      if (sub) {
        if (
          this.offerService
            .resolveUpgradePaths(sub.type)
            .includes(this.offer.id)
        ) {
          return 'UPGRADEABLE'
        } else {
          const [offerType] = this.offer.id.split('_')
          const [supType] = sub.type.split('_')

          if (offerType === supType) return 'UNAVAILABLE_CURRENT'

          return 'UNAVAILABLE'
        }
      }
    }

    return 'PURCHASABLE'
  }

  private async resolveCouponMetadata(): Promise<Record<string, string>> {
    const metadata: Record<string, string> = {}
    const resolvedCouponMetadata = await this.optionalSessionVars.couponMetadata
    if (resolvedCouponMetadata) {
      if (resolvedCouponMetadata.discountName) {
        metadata['discountName'] = resolvedCouponMetadata.discountName
      }
      Object.keys(resolvedCouponMetadata.metadata).forEach((key) => {
        metadata[`coupon_${key}`] = resolvedCouponMetadata.metadata[key]
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

  private async saveOrder(args: {
    checkoutId: string
    sess: Stripe.Checkout.Session
    lineItems: Stripe.LineItem[]
    mergedMetadata?: any
  }) {
    await this.invoiceService.saveOrder({
      id: args.checkoutId,
      company: this.offer.company,
      userId: this.optionalSessionVars.userId,
      externalId: args.sess.id,
      status: 'unpaid',
      metadata: args.mergedMetadata,
      expiresAt: new Date(args.sess.expires_at * 1000),
    })

    await this.invoiceService.saveOrderItems(
      args.lineItems.map((line) => {
        return {
          orderId: args.checkoutId,
          lineItemId: line.id,
          externalPriceId: line.price!.id,
          priceLookupKey: line.price!.lookup_key,
          description: line.description,
          quantity: line.quantity,
          price: line.amount_total,
          priceSubtotal: line.amount_subtotal,
          taxAmount: line.amount_tax,
          discountAmount: line.amount_discount,
        }
      }),
    )
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
