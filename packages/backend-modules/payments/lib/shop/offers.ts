import { Offer, OfferId, SubscriptionOffer } from '../types'
import { getConfig } from '../config'
import { GIFTS_ENABLED } from '../constants'

// Price change 2027: new prices apply to new purchases from 01.12.2026.
// Until 01.01.2027 everyone without their own (valid) promo code gets the
// transition discount PREIS2026, so the first period costs at most the old
// price (22 / 240). Only applied if the promo code exists in Stripe.
const PRICE_CHANGE_2027_EFFECTIVE = new Date('2027-01-01T00:00:00+01:00')

const PRICE_CHANGE_2027_TRANSITION = {
  code: 'PREIS2026',
  validUntil: PRICE_CHANGE_2027_EFFECTIVE,
}

const isBeforePriceChange2027 = (now: Date = new Date()) =>
  now < PRICE_CHANGE_2027_EFFECTIVE

// reduced membership coupons: old set until 31.12.2026, new (+20) set from 01.01.2027
function reducedMembershipCoupons(): string[] {
  const config = getConfig()
  if (isBeforePriceChange2027()) {
    return config.PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS
  }
  if (config.PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS_2027.length === 0) {
    console.warn(
      'PAYMENTS_PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS_2027 not set – falling back to the old reduced coupons',
    )
    return config.PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS
  }
  return config.PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS_2027
}

export const Offers: Readonly<Offer | SubscriptionOffer>[] = [
  {
    id: 'YEARLY' as OfferId,
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
    subscriptionType: 'YEARLY_SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    items: [{ type: 'PRICE', lookupKey: 'ABO' }],
    suggestedDonations: [60_00, 120_00, 240_00],
    allowPromotions: true,
    defaultPromotion: PRICE_CHANGE_2027_TRANSITION,
  },
  {
    id: 'YEARLY_REDUCED' as OfferId,
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
    subscriptionType: 'YEARLY_SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    // Price change 2027: in December the reduced offer stays on the old 240
    // price with the old reduced coupons; from 01.01.2027 it uses the new 260
    // price with the new (+20) coupons. The reduced price itself is unchanged.
    get items() {
      return [
        {
          type: 'PRICE' as const,
          lookupKey: isBeforePriceChange2027() ? 'ABO_2026' : 'ABO',
        },
      ]
    },
    get discountOptions() {
      return reducedMembershipCoupons().map((couponId) => ({
        type: 'DISCOUNT' as const,
        coupon: couponId,
      }))
    },
    allowPromotions: false,
  },
  {
    id: 'BENEFACTOR' as OfferId,
    name: 'Gönnermitgliedschaft',
    type: 'SUBSCRIPTION',
    subscriptionType: 'BENEFACTOR_SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    items: [{ type: 'PRICE', lookupKey: 'BENEFACTOR_ABO' }],
    suggestedDonations: [250_00, 500_00, 1000_00],
    allowPromotions: false,
  },
  {
    id: 'DONATION' as OfferId,
    name: 'Freiwilliger Beitrag',
    type: 'ONETIME_PAYMENT',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: false,
    items: [],
    suggestedDonations: [20_00, 50_00, 100_00],
    allowPromotions: false,
  },
  {
    id: 'STUDENT' as OfferId,
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
    subscriptionType: 'YEARLY_SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    items: [{ type: 'PRICE', lookupKey: 'ABO' }],
    fixedDiscount: 'AUSBILDUNG',
    allowPromotions: false,
    metaData: {
      'republik.reduced-price-reason': 'Ausbildung',
    },
  },
  {
    id: 'MONTHLY' as OfferId,
    name: 'Monats-Abo',
    type: 'SUBSCRIPTION',
    subscriptionType: 'MONTHLY_SUBSCRIPTION',
    company: 'REPUBLIK',
    requiresLogin: true,
    requiresAddress: false,
    allowPromotions: true,
    defaultPromotion: PRICE_CHANGE_2027_TRANSITION,
    items: [
      {
        type: 'PRICE',
        lookupKey: 'MONTHLY_ABO',
        taxRateId: getConfig().REPUBLIK_STRIPE_SUBSCRIPTION_TAX_ID,
      },
    ],
  },
]

export const GIFTS_OFFERS: Offer[] = [
  {
    id: 'GIFT_YEARLY' as OfferId,
    name: 'Jahresmitgliedschaft als Geschenk',
    type: 'ONETIME_PAYMENT',
    company: 'PROJECT_R',
    requiresLogin: false,
    allowPromotions: false,
    requiresAddress: false,
    complimentaryItems: [],
    items: [{ type: 'PRICE', lookupKey: 'GIFT_YEARLY' }],
  },
  {
    id: 'GIFT_MONTHLY' as OfferId,
    name: '3-Monats-Abo als Geschenk',
    type: 'ONETIME_PAYMENT',
    company: 'REPUBLIK',
    requiresLogin: false,
    allowPromotions: false,
    requiresAddress: false,
    complimentaryItems: [],
    items: [{ type: 'PRICE', lookupKey: 'GIFT_MONTHLY' }],
  },
]

export function activeOffers(): Readonly<Offer>[] {
  return [...Offers, ...(GIFTS_ENABLED() ? GIFTS_OFFERS : [])]
}
