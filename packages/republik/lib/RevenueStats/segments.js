const debug = require('debug')('republik:lib:RevenueStats:segments')
const { get, set } = require('lodash')
const { ascending } = require('d3-array')

const {
  cache: { create },
} = require('@orbiting/backend-modules-utils')

const QUERY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8 // A week and a day
const BUCKET_DATE_FORMAT = 'YYYY'

const query = `
SELECT
  pay.id,
  to_char(pay."createdAt" AT TIME ZONE :TZ, :BUCKET_DATE_FORMAT) "createdAtUnit",
  to_char(pay."updatedAt" AT TIME ZONE :TZ, :BUCKET_DATE_FORMAT) "updatedAtUnit",
  pay.status,
  COALESCE(p.total, pay.total) "total",
  p.donation,
  COALESCE(r.type::text, 'DONATE') "kind",
  COALESCE(mt.name, g.name, 'DONATE') "segment",
  COALESCE(po.amount, 1) "amount",
  COALESCE(po.periods, 1) "periods",
  COALESCE(po.price, 0) "price"

FROM "payments" pay

LEFT JOIN "pledgePayments" ppay ON ppay."paymentId" = pay.id
LEFT JOIN "pledges" p ON p.id = ppay."pledgeId"
LEFT JOIN "packages" pkgs ON pkgs.id = p."packageId"

LEFT JOIN "pledgeOptions" po ON po."pledgeId" = p.id
LEFT JOIN "packageOptions" pkgso ON pkgso.id = po."templateId"

LEFT JOIN "rewards" r ON r.id = pkgso."rewardId"
LEFT JOIN "membershipTypes" mt ON mt."rewardId" = r.id
LEFT JOIN "goodies" g ON g."rewardId" = r.id

GROUP BY pay.id, p.id, pkgs.id, r.id, po.id, mt.id, g.id

ORDER BY pay."createdAt" ASC
`

const handleStream = async (stream, handleRowFn) => {
  const data = {}

  return new Promise((resolve, reject) => {
    stream.on('data', async function onData(row) {
      try {
        stream.pause()

        await handleRowFn(row, data)

        stream.resume()
      } catch (e) {
        reject(e)
      }
    })

    stream.on('end', async function onEnd() {
      try {
        resolve(data)
      } catch (e) {
        reject(e)
      }
    })

    stream.on('error', function onError(e) {
      reject(e)
    })
  })
}

/**
 * Increase data counters
 *  - [created date unit].buckets[segment].amount
 *  - [created date unit].buckets[segment].sum
 */
const addRow = (row, data) => {
  const { createdAtUnit, segment, kind } = row

  const node = get(data, [createdAtUnit, 'buckets', segment], {
    kind,
    amount: 0,
    sum: 0,
  })

  set(data, [createdAtUnit, 'buckets', segment], {
    ...node,
    amount: node.amount + row.amount * (row.periods || 1),
    sum:
      (kind === 'DONATE' && node.sum + row.total) ||
      node.sum + row.amount * (row.periods || 1) * row.price,
  })
}

/**
 * Decrease data counters
 *  - [updated date unit].buckets[segment].amount
 *  - [updated date unit].buckets[segment].sum
 *
 * Decreases counters only if payment is cancelled or refunded.
 */
const subtractRow = (row, data) => {
  if (['CANCELLED', 'REFUNDED'].includes(row.status)) {
    const { updatedAtUnit, segment, kind } = row

    const node = get(data, [updatedAtUnit, 'buckets', segment], {
      kind,
      amount: 0,
      sum: 0,
    })

    set(data, [updatedAtUnit, 'buckets', segment], {
      ...node,
      amount: node.amount - row.amount * (row.periods || 1),
      sum:
        (kind === 'DONATE' && node.sum - row.total) ||
        node.sum - row.amount * (row.periods || 1) * row.price,
    })
  }
}

/**
 * Adds "add" payment donation to data
 *  - [created date unit].paymentDonation[payment ID:add]
 */
const addPaymentDontation = (row, data) => {
  const { kind, donation, createdAtUnit, id } = row

  if (kind !== 'DONATE' && donation !== 0) {
    set(data, [createdAtUnit, 'paymentDonation', `${id}:add`], donation)
  }
}

/**
 * Adds "subtract" payment donation to data
 *  - [created date unit].paymentDonation[payment ID:subtract]
 *
 * Adds payment dontation only if payment is cancelled or refunded.
 */
const subtractPaymentDonation = (row, data) => {
  const { status, kind, donation, updatedAtUnit, id } = row

  if (
    ['CANCELLED', 'REFUNDED'].includes(status) &&
    kind !== 'DONATE' &&
    donation !== 0
  ) {
    set(
      data,
      [updatedAtUnit, 'paymentDonation', `${id}:subtract`],
      0 - donation,
    )
  }
}

/**
 * Returns data object (dictionnary) as list
 *
 * data: {
      "unit 1": {
        buckets: {
          "segment a": { amount: 10, sum: 200 },
          "segment b": { amount: 10, sum: 200 },
          ...
        },
        paymentDonation: {
          "pledge 1:add": 100,
          "pledge 2:add": -20,
          ...
        }
      },
      "unit 2": {
        buckets: {
          "segment a": { amount: 10, sum: 200 },
          "segment b": { amount: 10, sum: 200 },
          ...
        },
        paymentDonation: {
          "pledge 1:add": 100,
          "pledge 2:add": -20,
          "pledge 2:subtract": 50,
          ...
        }
      },
      ...
    }
 * 
 * returns: [
    {
      key: "unit 1",
      buckets: [
        { key: "segment a", amount: 10, sum: 200 },
        { key: "segment b", amount: 10, sum: 200 },
        ...
      ],
      paymentDonation: { ... }
    },
    {
      key: "unit 2",
      buckets: [
        { key: "segment a", amount: 10, sum: 200 },
        { key: "segment b", amount: 10, sum: 200 },
        ...
      ],
      paymentDonation: { ... }
    },
    ...
  ]
 *
 */
const flattenData = (data) => {
  return Object.keys(data).map((key) => {
    const { buckets, ...rest } = data[key]

    return {
      key,
      buckets: Object.keys(buckets).map((bucketKey) => {
        const bucket = buckets[bucketKey]

        return { ...bucket, key: bucketKey }
      }),
      ...rest,
    }
  })
}

/**
 * Spreads payment donations to segments buckets.
 */
const spreadPaymentDonations = (bucket) => {
  const { buckets, paymentDonation } = bucket

  if (!paymentDonation) {
    return bucket
  }

  const donations = Object.keys(paymentDonation)
    .map((key) => paymentDonation[key])
    .reduce((a, b) => a + b, 0)

  const amounts = buckets
    .filter((bucket) => bucket.kind === 'MembershipType')
    .map((bucket) => bucket.amount)
    .reduce((a, b) => a + b, 0)

  const donationPerAmount = donations / amounts

  return {
    ...bucket,
    buckets: buckets.map((bucket) => {
      if (bucket.kind !== 'MembershipType') {
        return bucket
      }

      return {
        ...bucket,
        sum: bucket.sum + bucket.amount * donationPerAmount,
      }
    }),
  }
}

/**
 * Only keeps key and buckets[], and since currency values in database
 * are kept stored by factor 100, divides and roundes buckets[].sum.
 */
const normalize = (bucket) => {
  const { key, buckets } = bucket

  return {
    key,
    buckets: buckets.map((bucket) => ({
      ...bucket,
      sum: Math.round(bucket.sum / 100),
    })),
  }
}

const createCache = (context) =>
  create(
    {
      namespace: 'republik',
      prefix: 'RevenueStats:segments',
      key: 'any',
      ttl: QUERY_CACHE_TTL_SECONDS,
    },
    context,
  )

const populate = async (context, resultFn) => {
  debug('populate')

  const { pgdb } = context

  const stream = await pgdb.queryAsStream(query, {
    BUCKET_DATE_FORMAT,
    TZ: process.env.TZ || 'Europe/Zurich',
  })

  const data = await handleStream(stream, (row, data) => {
    addRow(row, data)
    subtractRow(row, data)
    addPaymentDontation(row, data)
    subtractPaymentDonation(row, data)
  })

  const result = flattenData(data)
    .map(spreadPaymentDonations)
    .map(normalize)
    .sort((a, b) => ascending(a.key, b.key))

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
