import { Company } from '../types'

/**
@var base currency amount to equal 1 Swiss Frank use this value to muliplie
*/
const CHF = 100
/**
@var base currency amount to equal 1 Swiss Rappen use this value to muliplie
*/
const RAPPEN = 1

export type OfferType = 'SUBSCRIPTION'

export type Offer = {
  id: string
  company: Company
  name: string
  type: OfferType
  productId?: string
  defaultPriceLookupKey: string
  taxRateId?: string
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

export const Offers: Offer[] = [
  {
    id: 'YEARLY',
    name: 'Jahresmitgliedschaft',
    type: 'SUBSCRIPTION',
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'ABO',
    allowPromotions: true,
  },
  {
    id: 'BENEFACTOR',
    name: 'Gönnermitgliedschaft',
    type: 'SUBSCRIPTION',
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'BENEFACTOR_ABO',
    allowPromotions: false,
    customPrice: {
      min: 1000 * CHF,
      max: 4000 * CHF,
      step: 100 * RAPPEN,
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
    defaultPriceLookupKey: 'STUDENT_ABO',
    allowPromotions: false,
    customPrice: {
      min: 120 * CHF,
      max: 239 * CHF,
      step: 50 * RAPPEN,
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
    defaultPriceLookupKey: 'ABO',
    allowPromotions: false,
    customPrice: {
      max: 2000 * CHF,
      min: 10 * CHF,
      step: 100 * RAPPEN,
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
    allowPromotions: true,
    defaultPriceLookupKey: 'MONTHLY_ABO',
    taxRateId: 'txr_1PqUouD5iIOpR5wNiT5EiKld',
  },
]
