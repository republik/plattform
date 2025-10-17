import { Offer, Subscription, SubscriptionOffer } from '../types'
import { getConfig } from '../config'
import { GIFTS_ENABLED } from '../constants'

export const Offers: Readonly<Offer | SubscriptionOffer>[] = [
  {
    id: 'YEARLY',
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
    subscriptionType: 'YEARLY_SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    items: [{ type: 'PRICE', lookupKey: 'ABO' }],
    suggestedDonations: [60_00, 120_00, 240_00],
    allowPromotions: true,
  },
  {
    id: 'YEARLY_REDUCED',
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
    subscriptionType: 'YEARLY_SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    items: [
      {
        type: 'PRICE',
        lookupKey: 'ABO',
      },
    ],
    discountOptions: getConfig().PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS.map(
      (couponId) => ({ type: 'DISCOUNT', coupon: couponId }),
    ),
    allowPromotions: false,
  },
  {
    id: 'BENEFACTOR',
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
    id: 'DONATION',
    name: 'Einmalige Spende',
    type: 'ONETIME_PAYMENT',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: false,
    items: [],
    suggestedDonations: [20_00, 50_00, 100_00],
    allowPromotions: false,
  },
  {
    id: 'STUDENT',
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
    id: 'MONTHLY',
    name: 'Monats-Abo',
    type: 'SUBSCRIPTION',
    subscriptionType: 'MONTHLY_SUBSCRIPTION',
    company: 'REPUBLIK',
    requiresLogin: true,
    requiresAddress: false,
    allowPromotions: true,
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
    id: 'GIFT_YEARLY',
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
    id: 'GIFT_MONTHLY',
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

export function resolveUpgradePaths(sub: Subscription): string[] {
  switch (sub.type) {
    case 'MONTHLY_SUBSCRIPTION':
      return ['YEARLY', 'YEARLY_REDUCED', 'STUDENT', 'BENEFACTOR']

    case 'YEARLY_SUBSCRIPTION':
      return ['BENEFACTOR', 'DONATION']

    case 'BENEFACTOR_SUBSCRIPTION':
      return ['DONATION']
  }
}
