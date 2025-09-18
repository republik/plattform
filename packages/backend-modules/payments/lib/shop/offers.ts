import { getConfig } from '../config'
import { Company } from '../types'

export const GIFTS_ENABLED = () =>
  process.env.PAYMENTS_SHOP_GIFTS_ENABLED === 'true'

export type OfferType = 'SUBSCRIPTION' | 'ONETIME_PAYMENT'
export type OfferAvailability = 'PURCHASABLE' | 'UPGRADEABLE' | 'UNAVAILABLE'

export type PriceDefinition = {
  type: 'PRICE'
  lookupKey: string
  taxRateId?: string
}
export type DiscountDefinition = { type: 'DISCOUNT'; coupon: string }

export type ComplimentaryItem = {
  id: string
  maxQuantity: number
  lookupKey: string
}

export type PriceInfo = {
  amount: number
  currency: string
  recurring?: {
    interval: 'year' | 'month'
    intervalCount: number
  }
}

export type ComplimentaryItemOrder = {
  id: string
  quantity: number
}

export type Offer = {
  id: string
  company: Company
  name: string
  type: OfferType
  items: PriceDefinition[]
  complimentaryItems?: ComplimentaryItem[]
  discountOpitions?: DiscountDefinition[]
  suggestedDonations?: number[]
  fixedDiscount?: string
  requiresLogin: boolean
  requiresAddress: boolean
  allowPromotions: boolean
  metaData?: {
    [name: string]: string | number | null
  }
  taxRateId?: string
}

export type OfferAPIResult = {
  id: string
  company: Company
  name: string
  availability: OfferAvailability
  startDate?: Date
  requiresLogin: boolean
  price: {
    amount: number
    currency: string
    recurring?: {
      interval: 'year' | 'month'
      intervalCount: number
    }
  }
  suggestedDonations?: number[]
  discount?: APIDiscountResult
}

export interface APIDiscountResult {
  id?: string
  name: string
  amountOff: number
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths: number | null
  currency: string
}

export type Discount = {
  id: string
  type: 'DISCOUNT'
  name: string
  amountOff: number
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths: number | null
  currency: string
}

export type Promotion = {
  id: string
  type: 'PROMO'
  name: string
  amountOff: number
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths: number | null
  currency: string
}

export type DiscountOption =
  | { type: 'DISCOUNT'; value: Discount }
  | { type: 'PROMO'; value: Promotion }

export const Offers: Readonly<Offer>[] = [
  {
    id: 'YEARLY',
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
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
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    items: [
      {
        type: 'PRICE',
        lookupKey: 'ABO',
      },
    ],
    discountOpitions: getConfig().PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS.map(
      (couponId) => ({ type: 'DISCOUNT', coupon: couponId }),
    ),
    allowPromotions: false,
  },
  {
    id: 'BENEFACTOR',
    name: 'Gönnermitgliedschaft',
    type: 'SUBSCRIPTION',
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
