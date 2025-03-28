import Stripe from 'stripe'
import { Company } from '../types'
import { Offer, ComplimentaryItemOrder } from './offers'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
import { getConfig } from '../config'
import { User } from '@orbiting/backend-modules-types'
import { PgDb } from 'pogi'
import { utils } from '.'

const INTRODUCTERY_OFFER_PROMO_CODE = 'EINSTIEG'

export class Shop {
  #offers: Offer[]
  #stripeAdapters: Record<Company, Stripe> = {
    PROJECT_R: ProjectRStripe,
    REPUBLIK: RepublikAGStripe,
  }
  #promoCodeBlocklist: string[] = [INTRODUCTERY_OFFER_PROMO_CODE]

  constructor(offers: Offer[]) {
    this.#offers = offers
  }

  async generateCheckoutSession({
    offer,
    customerId,
    uiMode = 'EMBEDDED',
    customPrice,
    discounts,
    metadata,
    customFields,
    returnURL,
    complimentaryItems,
  }: {
    offer: Offer
    uiMode: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
    customerId?: string
    discounts?: string[]
    customPrice?: number
    complimentaryItems?: ComplimentaryItemOrder[]
    metadata?: Record<string, string>
    returnURL?: string
    customFields?: Stripe.Checkout.SessionCreateParams.CustomField[]
  }) {
    const lineItem = this.genLineItem(offer, customPrice)

    const uiConfig = checkoutUIConfig(
      uiMode,
      offer,
      returnURL ??
        `${getConfig().SHOP_BASE_URL}/angebot/${
          offer.id
        }?session_id={CHECKOUT_SESSION_ID}`,
    )

    const checkoutMode =
      offer.type === 'SUBSCRIPTION' ? 'subscription' : 'payment'

    return this.#stripeAdapters[offer.company].checkout.sessions.create({
      ...uiConfig,
      mode: checkoutMode,
      customer: customerId,
      line_items: [
        lineItem,
        ...(complimentaryItems?.map(promoItemToLineItem) || []),
      ],
      currency: offer.price?.currency,
      discounts: discounts?.map((id) => ({ coupon: id })),
      locale: 'de',
      billing_address_collection:
        offer.company === 'PROJECT_R' ? 'required' : 'auto',
      shipping_address_collection: complimentaryItems?.length
        ? {
            allowed_countries: ['CH'],
          }
        : undefined,
      custom_fields: offer.requiresLogin ? customFields : undefined,
      payment_method_configuration: getPaymentConfigId(offer.company),
      metadata: {
        ...metadata,
        ...offer.metaData,
      },
      subscription_data:
        offer.type === 'SUBSCRIPTION'
          ? {
              metadata: {
                ...metadata,
                ...offer.metaData,
              },
            }
          : undefined,
      consent_collection: {
        terms_of_service: 'required',
      },
    })
  }

  async getOfferById(
    id: string,
    options?: { promoCode?: string; withIntroductoryOffer?: boolean },
  ): Promise<Offer | null> {
    const offer = this.#offers.find((offer) => id === offer.id)

    if (!offer) {
      return null
    }

    const price = (
      await this.#stripeAdapters[offer.company].prices.list({
        active: true,
        lookup_keys: [offer.defaultPriceLookupKey],
        expand: ['data.product'],
      })
    ).data[0]

    return this.mergeOfferData(offer, price, options)
  }

  async getOffers(options?: {
    promoCode?: string
    withIntroductoryOffer?: boolean
  }): Promise<Offer[]> {
    return (
      await Promise.all([
        this.getOffersByCompany('REPUBLIK', options),
        this.getOffersByCompany('PROJECT_R', options),
      ])
    ).flat()
  }

  async getOffersByCompany(
    company: Company,
    options?: { promoCode?: string; withIntroductoryOffer?: boolean },
  ) {
    const offers = this.#offers.filter((offer) => company === offer.company)
    const lookupKeys = offers.map((o) => o.defaultPriceLookupKey)

    const priceData = (
      await this.#stripeAdapters[company].prices.list({
        active: true,
        lookup_keys: lookupKeys,
        expand: ['data.product'],
      })
    ).data

    return (
      await Promise.allSettled(
        offers.map(async (offer) => {
          const price = priceData.find(
            (p) => p.lookup_key === offer.defaultPriceLookupKey,
          )!

          return this.mergeOfferData(offer, price, options)
        }),
      )
    ).reduce((acc: Offer[], res) => {
      if (res.status === 'fulfilled') {
        acc.push(res.value)
      }
      return acc
    }, [])
  }

  private async mergeOfferData(
    base: Offer,
    price: Stripe.Price,
    options?: { promoCode?: string; withIntroductoryOffer?: boolean },
  ): Promise<Offer> {
    const discount = await this.getIndrodcuturyOfferOrPromotion(base, options)
    return {
      ...base,
      productId: (price.product as Stripe.Product).id,
      price: {
        id: price.id,
        amount: price.unit_amount!,
        currency: price.currency,
        recurring: price.recurring
          ? {
              interval: price.recurring.interval as 'year' | 'month',
              interval_count: price.recurring.interval_count,
            }
          : undefined,
      },
      discount: discount ?? undefined,
    }
  }

  private async getIndrodcuturyOfferOrPromotion(
    offer: Offer,
    options:
      | { promoCode?: string; withIntroductoryOffer?: boolean }
      | undefined,
  ): Promise<{
    name: string
    couponId: string
    amountOff: number
    currency: string
  } | null> {
    if (!offer.allowPromotions) {
      return null
    }

    if (options?.promoCode && !this.inPromoCodeBlocklist(options.promoCode)) {
      const promotion = await this.getPromotion(
        offer.company,
        options.promoCode,
      )
      return promotion
        ? {
            name: promotion.coupon.name!,
            couponId: promotion.coupon.id!,
            amountOff: promotion.coupon.amount_off!,
            currency: promotion.coupon.currency!,
          }
        : null
    }

    if (options?.withIntroductoryOffer) {
      const promotion = await this.getPromotion(
        offer.company,
        INTRODUCTERY_OFFER_PROMO_CODE,
      )
      return promotion
        ? {
            name: promotion.coupon.name!,
            couponId: promotion.coupon.id!,
            amountOff: promotion.coupon.amount_off!,
            currency: promotion.coupon.currency!,
          }
        : null
    }

    return null
  }

  private inPromoCodeBlocklist(promoCode: string) {
    return this.#promoCodeBlocklist.includes(promoCode.toUpperCase())
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

  public genLineItem(offer: Offer, customPrice?: number) {
    if (
      offer.type === 'SUBSCRIPTION' &&
      offer.customPrice &&
      typeof customPrice !== 'undefined'
    ) {
      return {
        price_data: {
          product: offer.productId!,
          unit_amount: Math.max(offer.customPrice.min, customPrice),
          currency: offer.price!.currency,
          recurring: offer.customPrice!.recurring,
        },
        tax_rates: offer.taxRateId ? [offer.taxRateId] : undefined,
        quantity: 1,
      }
    }

    return {
      price: offer.price!.id,
      tax_rates: offer.taxRateId ? [offer.taxRateId] : undefined,
      quantity: 1,
    }
  }
}

function getPaymentConfigId(company: Company) {
  switch (company) {
    case 'PROJECT_R':
      return getConfig().PROJECT_R_STRIPE_PAYMENTS_CONFIG_ID
    case 'REPUBLIK':
      return getConfig().REPUBLIK_STRIPE_PAYMENTS_CONFIG_ID
  }
}

export async function checkIntroductoryOfferEligibility(
  pgdb: PgDb,
  user?: User,
): Promise<boolean> {
  if (
    process.env.PAYMENTS_INTRODUCTORY_OFFER_ELIGIBILITY_FOR_EVERYONE === 'true'
  ) {
    return true
  }

  if (!user) {
    // if there is no user we show the entry offers
    return true
  }

  if ((await utils.hasHadMembership(user?.id, pgdb)) === false) {
    return true
  }

  return false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function promoItemToLineItem(_item: ComplimentaryItemOrder) {
  return {
    price: 'price_1QQUCcFHX910KaTH9SKJhFZI',
    quantity: 1,
  }
}

function checkoutUIConfig(
  uiMode: 'HOSTED' | 'CUSTOM' | 'EMBEDDED',
  offer: Offer,
  returnURL: string,
) {
  switch (uiMode) {
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
        redirect_on_completion:
          'if_required' as Stripe.Checkout.SessionCreateParams.RedirectOnCompletion,
      }
    case 'HOSTED':
      return {
        ui_mode: 'hosted' as Stripe.Checkout.SessionCreateParams.UiMode,
        success_url: returnURL,
        cancel_url: `${getConfig().SHOP_BASE_URL}/angebot/${offer.id}`,
      }
  }
}
