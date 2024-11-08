import { Company } from '../types'

/**
@var base currency amount to equal 1 Swiss Frank use this value to muliplie
*/
const CHF = 100
/**
@var base currency amount to equal 1 Swiss Rappen use this value to muliplie
*/
const RAPPEN = 1

export type Offer = {
  id: string
  company: Company
  productId?: string
  defaultPriceLookupKey: string
  taxRateId?: string
  promoCode?: string
  entryCode?: string
  price?: {
    id: string
    amount: number
    currency: string
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
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'ABO',
    entryCode: 'EINSTIEG',
  },
  {
    id: 'BENEFACTOR',
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'BENEFACTOR_ABO',
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
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'STUDENT_ABO',
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
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'ABO',
    customPrice: {
      max: 2000 * CHF,
      min: 240 * CHF,
      step: 50 * RAPPEN,
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
    },
  },
  {
    id: 'MONTHLY',
    company: 'REPUBLIK',
    entryCode: 'EINSTIEG',
    defaultPriceLookupKey: 'MONTHLY_ABO',
    taxRateId: 'txr_1PqUouD5iIOpR5wNiT5EiKld',
  },
]
