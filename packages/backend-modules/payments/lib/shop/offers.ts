import { getConfig } from '../config'
import { Company } from '../types'

export const GIFTS_ENABLED = () =>
  process.env.PAYMENTS_SHOP_GIFTS_ENABLED === 'true'

export type OfferType = 'SUBSCRIPTION' | 'ONETIME_PAYMENT'

export type PriceDefinition = {
  type: 'PRICE'
  lookupKey: string
  taxRateId?: string
}
export type DiscountDefinition = { type: 'DISCOUNT'; promoCode: string }

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
  items: PriceDefinition[]
  complimentaryItems?: ComplimentaryItem[]
  donationOptions?: PriceDefinition[]
  fixedDiscount?: string
  requiresLogin: boolean
  requiresAddress: boolean
  allowPromotions: boolean
  allowIntroductoryOffer?: boolean
  metaData?: {
    [name: string]: string | number | null
  }
  taxRateId?: string
}

export type OfferAPIResult = {
  id: string
  company: Company
  name: string
  requiresLogin: boolean
  price: {
    amount: number
    currency: string
    recurring?: {
      interval: 'year' | 'month'
      intervalCount: number
    }
  }
  donationOptions?: {
    id: string
    price: {
      amount: number
      currency: string
      recurring?: {
        interval: 'year' | 'month'
        intervalCount: number
      }
    }
  }[]
  discount?: Discount
}

export type Discount = {
  name: string
  promoCodeId: string
  couponId: string
  amountOff: number
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths: number | null
  currency: string
}

// const PROMO_ITEM_REPUBLIK_BIBLIOTEK_1 = {
//   id: 'REPUBLIK_BILIOTHEK_1',
//   maxQuantity: 1,
//   lookupKey: 'REPUBLIK_BILIOTHEK_1',
// }

export const Offers: Readonly<Offer>[] = [
  {
    id: 'YEARLY',
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    allowIntroductoryOffer: true,
    items: [{ type: 'PRICE', lookupKey: 'ABO' }],
    donationOptions: [
      { type: 'PRICE', lookupKey: 'ABO_DONATE_OPTION_YEARLY_020' },
      { type: 'PRICE', lookupKey: 'ABO_DONATE_OPTION_YEARLY_120' },
      { type: 'PRICE', lookupKey: 'ABO_DONATE_OPTION_YEARLY_240' },
    ],
    allowPromotions: true,
  },
  {
    id: 'BENEFACTOR',
    name: 'Gönnermitgliedschaft',
    type: 'SUBSCRIPTION',
    company: 'PROJECT_R',
    requiresLogin: true,
    requiresAddress: true,
    items: [{ type: 'PRICE', lookupKey: 'BENEFACTOR_ABO' }],
    allowPromotions: false,
  },
  {
    id: 'STUDENT',
    name: 'Ausbildungs-Mitgliedschaft',
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
    allowIntroductoryOffer: true,
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
    name: 'Jahresmitgliedschafts Geschenk',
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
    name: '3 Monats Abo Geschenk',
    type: 'ONETIME_PAYMENT',
    company: 'REPUBLIK',
    requiresLogin: false,
    allowPromotions: false,
    requiresAddress: false,
    complimentaryItems: [],
    items: [{ type: 'PRICE', lookupKey: 'GIFT_MONTHLY' }],
  },
]

export function activeOffers(): Offer[] {
  return [...Offers, ...(GIFTS_ENABLED() ? GIFTS_OFFERS : [])]
}
