import Stripe from 'stripe'
import { Company } from '../types'
import {
  Offer,
  ComplimentaryItemOrder,
  OfferAPIResult,
  PriceDefinition,
  Discount,
} from './offers'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
import { getConfig } from '../config'
import { User } from '@orbiting/backend-modules-types'
import { PgDb } from 'pogi'
import { utils } from '.'

export const INTRODUCTERY_OFFER_PROMO_CODE = 'EINSTIEG'

export function isPromoCodeInBlocklist(promoCode: string) {
  return [INTRODUCTERY_OFFER_PROMO_CODE].includes(promoCode)
}

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
    uiMode = 'EMBEDDED',
    promoCode,
    metadata,
    customFields,
    selectedDonation,
    returnURL,
    complimentaryItems,
  }: {
    offer: Offer
    uiMode: 'HOSTED' | 'CUSTOM' | 'EMBEDDED'
    customerId?: string
    promoCode?: string
    customPrice?: number
    selectedDonation?: string
    complimentaryItems?: ComplimentaryItemOrder[]
    metadata?: Record<string, string>
    returnURL?: string
    customFields?: Stripe.Checkout.SessionCreateParams.CustomField[]
  }) {
    const lineItems = await this.genLineItems(offer)
    if (typeof offer.donationOptions !== 'undefined' && selectedDonation) {
      const res = await this.#stripeAdapters[offer.company].prices.list({
        lookup_keys: [selectedDonation],
      })

      const donation = res.data[0]
      if (donation.lookup_key === selectedDonation) {
        lineItems.push({
          price: donation.id,
          quantity: 1,
        })
      }
    }
    const discount = await this.resolveDiscount(offer, promoCode)

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
      line_items: lineItems,
      currency: 'CHF',
      discounts: discount ? [{ coupon: discount.couponId }] : undefined,
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

  public async genLineItems(
    offer: Offer,
  ): Promise<{ price: string; quantity: number; tax_rates?: string[] }[]> {
    const pricesLKs = offer.items.map((i) => i.lookupKey)

    const prices = await this.#stripeAdapters[offer.company].prices.list({
      lookup_keys: pricesLKs,
    })

    return prices.data.map((p) => {
      const priceConfig = offer.items.find((i) => i.lookupKey === p.lookup_key)

      return {
        price: p.id,
        quantity: 1,
        tax_rates: priceConfig?.taxRateId
          ? [priceConfig?.taxRateId]
          : undefined,
      }
    })
  }

  isValidOffer(id: string) {
    const offer = this.#offers.find((offer) => id === offer.id)

    if (!offer) {
      throw new Error('Invalid Offer')
    }

    return offer
  }

  async getOfferById(
    id: string,
    promoCode?: string,
  ): Promise<OfferAPIResult | null> {
    const offer = this.#offers.find((offer) => id === offer.id)

    if (!offer) {
      return null
    }

    const pricesLK = offer.items
      .map((i) => i.lookupKey)
      .concat(offer.donationOptions?.map((d) => d.lookupKey) || [])

    const prices = await this.#stripeAdapters[offer.company].prices.list({
      active: true,
      lookup_keys: pricesLK,
      expand: ['data.product'],
    })

    const price = prices.data.find(
      (p) => p.lookup_key === offer.items[0].lookupKey,
    )!

    const donations = prices.data.filter((p) =>
      (offer.donationOptions?.map((d) => d.lookupKey) || []).includes(
        p.lookup_key!,
      ),
    )!

    console.log(donations)

    const discount = await this.resolveDiscount(offer, promoCode)

    return this.mergeOfferData(offer, price, donations, discount)
  }

  async getOffers(promoCode?: string): Promise<OfferAPIResult[]> {
    return (
      await Promise.all([
        this.getOffersByCompany('REPUBLIK', promoCode),
        this.getOffersByCompany('PROJECT_R', promoCode),
      ])
    ).flat()
  }

  async getOffersByCompany(company: Company, promoCode?: string) {
    const offers = this.#offers.filter((offer) => company === offer.company)
    const lookupKeys = offers.flatMap((o) =>
      o.items
        .map((i) => i.lookupKey)
        .concat(o.donationOptions?.map((d) => d.lookupKey) || []),
    )

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
            (p) =>
              p.lookup_key === (offer.items[0] as PriceDefinition).lookupKey,
          )!

          const donations = priceData.filter((p) =>
            (offer.donationOptions?.map((d) => d.lookupKey) || []).includes(
              p.lookup_key!,
            ),
          )!

          console.log(donations)

          const discount = await this.resolveDiscount(offer, promoCode)

          return this.mergeOfferData(offer, price, donations, discount)
        }),
      )
    ).reduce((acc: OfferAPIResult[], res) => {
      if (res.status === 'fulfilled') {
        acc.push(res.value)
      }
      return acc
    }, [])
  }

  private async mergeOfferData(
    base: Offer,
    price: Stripe.Price,
    donations: Stripe.Price[],
    discount?: OfferAPIResult['discount'] | null,
  ): Promise<OfferAPIResult> {
    return {
      ...base,
      price: {
        amount: price.unit_amount!,
        currency: price.currency,
        recurring: price.recurring
          ? {
              interval: price.recurring.interval as 'year' | 'month',
              intervalCount: price.recurring.interval_count,
            }
          : undefined,
      },
      donationOptions:
        donations.length > 0
          ? donations.map((d) => ({
              id: d.lookup_key!,
              price: {
                amount: d.unit_amount!,
                currency: d.currency,
                recurring: d.recurring
                  ? {
                      interval: d.recurring.interval as 'year' | 'month',
                      intervalCount: d.recurring.interval_count,
                    }
                  : undefined,
              },
            }))
          : undefined,
      discount: discount ?? undefined,
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

  async resolveDiscount(offer: Offer, promoCode: string | undefined) {
    if (promoCode && offer.allowPromotions) {
      const promotion = await this.getPromotion(offer.company, promoCode)
      return promotionToDiscount(promotion)
    }

    if (offer.fixedDiscount) {
      const promotion = await this.getPromotion(
        offer.company,
        offer.fixedDiscount,
      )
      return promotionToDiscount(promotion)
    }

    return null
  }
}

function promotionToDiscount(
  promotion: Stripe.PromotionCode | null,
): Discount | null {
  return promotion
    ? {
        name: promotion.coupon.name!,
        couponId: promotion.coupon.id!,
        duration: promotion.coupon.duration,
        durationInMonths: promotion.coupon.duration_in_months,
        amountOff: promotion.coupon.amount_off!,
        currency: promotion.coupon.currency!,
      }
    : null
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
      }
    case 'HOSTED':
      return {
        ui_mode: 'hosted' as Stripe.Checkout.SessionCreateParams.UiMode,
        success_url: returnURL,
        cancel_url: `${getConfig().SHOP_BASE_URL}/angebot/${offer.id}`,
      }
  }
}
