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
  productId: string
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
    productId: 'prod_G7dVG5BtM4wDxl',
  },
  {
    id: 'BENEFACTOR',
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'BENEFACTOR_ABO',
    productId: 'prod_G7dVG5BtM4wDxl',
    customPrice: {
      min: 1000 * CHF,
      max: 4000 * CHF,
      step: 100 * RAPPEN,
    },
  },
  {
    id: 'STUDENT',
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'STUDENT_ABO',
    productId: 'prod_G7dVG5BtM4wDxl',
    customPrice: {
      min: 120 * CHF,
      max: 239 * CHF,
      step: 50 * RAPPEN,
    },
  },
  {
    id: 'CUSTOM',
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'ABO',
    productId: 'prod_G7dVG5BtM4wDxl',
    customPrice: {
      max: 2000 * CHF,
      min: 240 * CHF,
      step: 50 * RAPPEN,
    },
  },
  {
    id: 'MONTHLY',
    company: 'REPUBLIK',
    productId: 'prod_Ccmy87SuPqF5OM',
    entryCode: 'EINSTIEG',
    defaultPriceLookupKey: 'MONTHLY_ABO',
    taxRateId: 'txr_1PqUouD5iIOpR5wNiT5EiKld',
  },
]
