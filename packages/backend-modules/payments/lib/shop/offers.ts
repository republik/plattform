import { Offer, OfferId, SubscriptionOffer } from '../types'
import { getConfig } from '../config'
import { GIFTS_ENABLED } from '../constants'

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
  },
  {
    id: 'YEARLY_REDUCED' as OfferId,
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
