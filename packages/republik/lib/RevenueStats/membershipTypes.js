const debug = require('debug')('republik:lib:RevenueStats:membershipTypes')
const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day

const createCache = (context) =>
  create(
    {
      namespace: 'republik',
      prefix: 'RevenueStats:membershipTypes',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  // const { pgdb } = context

  const result = [
    /* 
    type RevenueStatsMembershipTypesBucket {
      key: String!
      type: MembershipType!
      regular: Int!
      withDonation: Int!
      withDiscount: Int!
    }
    */
  ]

  if (resultFn) {
    return resultFn(result)
  }

  // Cache said data.
  await createCache(context).set({ result, updatedAt: new Date() })
}

module.exports = {
  createCache,
  populate,
}
