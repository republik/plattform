import Stripe from 'stripe'
import { ProjectRStripe, RepublikAGStripe } from '../providers/stripe'
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

export async function loadProjectRStripeCatalog(): Promise<any[]> {
  const products = await ProjectRStripe.products.list({
    active: true,
    type: 'service',
    expand: ['data.default_price'],
  })

  return products.data
}

export async function loadRepublikAGStripeCatalog(): Promise<any[]> {
  const products = await RepublikAGStripe.products.list({
    active: true,
    type: 'service',
    expand: ['data.default_price'],
  })

  return products.data
}

export async function loadPrices(stripe: Stripe, lookupKeys: string[]) {
  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring',
    lookup_keys: lookupKeys,
    expand: ['data.product'],
  })
  return prices.data
}

export const Offers: Offer[] = [
  {
    id: 'YEARLY',
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'ABO',
    productId: 'prod_G7dVG5BtM4wDxl',
  },
  {
    id: 'BENEFACTOR',
    company: 'PROJECT_R',
    defaultPriceLookupKey: 'BENEFACTOR_ABO',
    productId: 'prod_G7dVG5BtM4wDxl',
    customPrice: {
      min: 360 * CHF,
      max: 2000 * CHF,
      step: 50 * RAPPEN,
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
      max: 1000 * CHF,
      min: 240 * CHF,
      step: 50 * RAPPEN,
    },
  },
  {
    id: 'MONTHLY',
    company: 'REPUBLIK',
    productId: 'prod_Ccmy87SuPqF5OM',
    defaultPriceLookupKey: 'MONTHLY_ABO',
    taxRateId: 'txr_1PqUouD5iIOpR5wNiT5EiKld',
  },
]

const ProjectRPriceLookupKeys: string[] = Offers.filter(
  (o) => o.company === 'PROJECT_R',
).map((o) => {
  return o?.defaultPriceLookupKey
})

function groupBy<K extends string | number | symbol, T>(
  items: T[],
  fn: (i: any) => K,
) {
  const obj: Record<K, T[]> = {} as Record<K, T[]>
  for (const i of items) {
    const key = fn(i)
    if (!obj[key]) {
      obj[key] = []
    }
    obj[key].push(i)
  }

  return obj
}

const OffersByCompany = groupBy(Offers, (o) => o.company)

const store: Record<Company, { stripe: Stripe; lookupKeys: string[] }> = {
  PROJECT_R: {
    stripe: ProjectRStripe,
    lookupKeys: ProjectRPriceLookupKeys,
  },
  REPUBLIK: {
    stripe: RepublikAGStripe,
    lookupKeys: ['MONTHLY_ABO'],
  },
}

export async function fetchOffers({
  company,
  offers,
  promoCode,
}: {
  company: Company
  offers?: string[]
  promoCode?: string
}) {
  const prices = await loadPrices(
    store[company].stripe,
    offers ?? store[company].lookupKeys,
  )

  const promotion = promoCode
    ? await getPromotion(store[company].stripe, promoCode)
    : null

  return OffersByCompany[company].map((offer) => {
    const price = prices.find(
      (o) => o.lookup_key === offer.defaultPriceLookupKey,
    )!

    return {
      ...offer,
      price: {
        id: price.id,
        amount: price.unit_amount!,
        currency: price.currency,
      },
      discount: promotion && {
        name: promotion.coupon.name!,
        amountOff: promotion.coupon.amount_off!,
        currency: promotion.coupon.currency!,
      },
    }
  })
}
async function getPromotion(stripe: Stripe, promoCode: string) {
  const promition = await stripe.promotionCodes.list({
    active: true,
    code: promoCode,
    limit: 1,
  })

  if (promition.data.length !== 1) {
    return null
  }

  return promition.data[0]
}
