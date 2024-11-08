import Stripe from 'stripe'
import { Company } from '../types'
import { Offer } from './offers'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
import { getConfig } from '../config'

export class Shop {
  #offers: Offer[]
  #stripeAdapters: Record<Company, Stripe> = {
    PROJECT_R: ProjectRStripe,
    REPUBLIK: RepublikAGStripe,
  }

  constructor(offers: Offer[]) {
    this.#offers = offers
  }

  async generateCheckoutSession({
    offer,
    customerId,
    uiMode = 'embedded',
    customPrice,
    discounts,
    analytics,
  }: {
    offer: Offer
    uiMode: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
    customerId: string
    discounts?: string[]
    customPrice?: number
    analytics?: Record<string, string>
  }) {
    const lineItem = this.genLineItem(offer, customPrice)

    return this.#stripeAdapters[offer.company].checkout.sessions.create({
      mode: 'subscription',
      ui_mode: uiMode.toLowerCase(),
      customer: customerId,
      line_items: [lineItem],
      currency: offer.price?.currency,
      discounts: discounts?.map((id) => ({ coupon: id })),
      // '{CHECKOUT_SESSION_ID}' is prefilled by stripe
      return_url:
        uiMode !== 'HOSTED'
          ? `${getConfig().SHOP_BASE_URL}/angebot/${
              offer.id
            }?session_id={CHECKOUT_SESSION_ID}`
          : undefined,
      success_url:
        uiMode === 'HOSTED'
          ? `${getConfig().SHOP_BASE_URL}/angebot/${
              offer.id
            }?session_id={CHECKOUT_SESSION_ID}`
          : undefined,
      locale: 'de',
      redirect_on_completion: uiMode !== 'HOSTED' ? 'if_required' : undefined,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          ...analytics,
          ...offer.metaData,
        },
      },
      consent_collection: {
        terms_of_service: 'required',
      },
    })
  }

  async getOfferById(
    id: string,
    options?: { withDiscount: boolean },
  ): Promise<Offer | null> {
    const offer = this.#offers.find((offer) => id === offer.id)

    if (!offer) {
      return null
    }

    const price = (
      await this.#stripeAdapters[offer.company].prices.list({
        active: true,
        type: 'recurring',
        lookup_keys: [offer.defaultPriceLookupKey],
        expand: ['data.product'],
      })
    ).data[0]

    return this.mergeOfferData(offer, price, options)
  }

  async getOffers(options?: { withDiscount: boolean }): Promise<Offer[]> {
    return (
      await Promise.all([
        this.getOffersByCompany('REPUBLIK', options),
        this.getOffersByCompany('PROJECT_R', options),
      ])
    ).flat()
  }

  async getOffersByCompany(
    company: Company,
    options?: { withDiscount: boolean },
  ) {
    const offers = this.#offers.filter((offer) => company === offer.company)
    const lookupKeys = offers.map((o) => o.defaultPriceLookupKey)

    const priceData = (
      await this.#stripeAdapters[company].prices.list({
        active: true,
        type: 'recurring',
        lookup_keys: lookupKeys,
        expand: ['data.product'],
      })
    ).data

    return Promise.all(
      offers.map(async (offer) => {
        const price = priceData.find(
          (p) => p.lookup_key === offer.defaultPriceLookupKey,
        )!

        return this.mergeOfferData(offer, price, options)
      }),
    )
  }

  private async mergeOfferData(
    base: Offer,
    price: Stripe.Price,
    options?: { withDiscount: boolean },
  ): Promise<Offer> {
    let discount: Offer['discount'] | undefined = undefined
    if (options?.withDiscount && base.entryCode) {
      const promotion = await this.getPromotion(base.company, base.entryCode)
      discount = promotion
        ? {
            name: promotion.coupon.name!,
            couponId: promotion.coupon.id!,
            amountOff: promotion.coupon.amount_off!,
            currency: promotion.coupon.currency!,
          }
        : undefined
    }

    return {
      ...base,
      productId: (price.product as Stripe.Product).id,
      price: {
        id: price.id,
        amount: price.unit_amount!,
        currency: price.currency,
      },
      discount: discount,
    }
  }

  async getPromotion(
    company: Company,
    promoCode: string,
  ): Promise<Stripe.PromotionCode | null> {
    const promition = await this.#stripeAdapters[company].promotionCodes.list({
      active: true,
      code: promoCode,
      limit: 1,
    })

    if (promition.data.length !== 1) {
      return null
    }

    return promition.data[0]
  }

  private genLineItem(offer: Offer, customPrice?: number) {
    if (offer.customPrice && typeof customPrice !== 'undefined') {
      return {
        price_data: {
          product: offer.productId,
          unit_amount: Math.max(offer.customPrice.min, customPrice),
          currency: offer.price!.currency,
          recurring: offer.customPrice!.recurring,
        },
        tax_rates: offer.taxRateId ? [offer.taxRateId] : undefined,
        quantity: 1,
      }
    }

    return {
      price: offer.price?.id,
      tax_rates: offer.taxRateId ? [offer.taxRateId] : undefined,
      quantity: 1,
    }
  }
}
