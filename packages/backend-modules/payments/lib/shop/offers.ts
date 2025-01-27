import { getConfig } from '../config'
import { Company } from '../types'

export const GIFTS_ENABLED = () =>
  process.env.PAYMENTS_SHOP_GIFTS_ENABLED === 'true'

/**
@var base currency amount to equal 1 Swiss Frank use this value to muliplie
*/
const CHF = 100

export type OfferType = 'SUBSCRIPTION' | 'ONETIME_PAYMENT'

export type ComplimentaryItem = {
  id: string
  maxQuantity: number
  lookupKey: string
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
  productId?: string
  defaultPriceLookupKey: string
  taxRateId?: string
  requiresLogin: boolean
  complimentaryItems?: ComplimentaryItem[]
  allowPromotions: boolean
  price?: {
    id: string
    amount: number
    currency: string
    recurring?: {
      interval: 'year' | 'month'
      interval_count: number
    }
  }
  customPrice?: {
    min: number
    max: number
    step: number
    recurring: {
      interval: 'year'
      interval_count: 1
    }
  }
  discount?: {
    name: string
    couponId: string
    amountOff: number
    currency: string
  }
  // Data to be appended to the subscription's metadata.
  metaData?: {
    [name: string]: string | number | null
  }
}

const PROMO_ITEM_REPUBLIK_BIBLIOTEK_1 = {
  id: 'REPUBLIK_BILIOTHEK_1',
  maxQuantity: 1,
  lookupKey: 'REPUBLIK_BILIOTHEK_1',
}

export const Offers: Offer[] = [
  {
    id: 'YEARLY',
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    defaultPriceLookupKey: 'ABO',
    allowPromotions: true,
  },
  {
    id: 'BENEFACTOR',
    name: 'Gönnermitgliedschaft',
    type: 'SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    defaultPriceLookupKey: 'BENEFACTOR_ABO',
    allowPromotions: false,
    customPrice: {
      min: 1000 * CHF,
      max: 4000 * CHF,
      step: 10 * CHF,
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
    },
  },
  {
    id: 'STUDENT',
    name: 'Ausbildungs-Mitgliedschaft',
    type: 'SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    defaultPriceLookupKey: 'STUDENT_ABO',
    allowPromotions: false,
    customPrice: {
      min: 140 * CHF,
      max: 239 * CHF,
      step: 1 * CHF,
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
    },
  },
  {
    id: 'CUSTOM',
    type: 'SUBSCRIPTION',
    name: 'Jahresmitgliedschaft',
    company: 'PROJECT_R',
    requiresLogin: true,
    defaultPriceLookupKey: 'ABO',
    allowPromotions: false,
    customPrice: {
      max: 2000 * CHF,
      min: 10 * CHF,
      step: 1 * CHF,
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
    },
  },
  {
    id: 'MONTHLY',
    name: 'Monats-Abo',
    type: 'SUBSCRIPTION',
    company: 'REPUBLIK',
    requiresLogin: true,
    allowPromotions: true,
    defaultPriceLookupKey: 'MONTHLY_ABO',
    taxRateId: getConfig().REPUBLIK_STRIPE_SUBSCRIPTION_TAX_ID,
  },
]

export const GIFTS_OFFERS: Offer[] = [
  {
    id: 'GIFT_YEARLY',
    name: 'Jahresmitgliedschafts Geschenk',
    type: 'ONETIME_PAYMENT',
    company: 'PROJECT_R',
    requiresLogin: false,
    allowPromotions: false,
    complimentaryItems: [PROMO_ITEM_REPUBLIK_BIBLIOTEK_1],
    defaultPriceLookupKey: 'GIFT_YEARLY',
  },
]

export function activeOffers(): Offer[] {
  return [...Offers, ...(GIFTS_ENABLED() ? GIFTS_OFFERS : [])]
}
