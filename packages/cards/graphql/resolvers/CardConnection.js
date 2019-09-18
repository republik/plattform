const _ = require('lodash')

const getAggregationKeyValue = (card, key) => {
  switch (key) {
    case 'party': return _.get(card, 'payload.party')
    case 'fraction': return _.get(card, 'payload.fraction')
  }
}

module.exports = {
  aggregations (connection, args) {
    const { keys } = args

    const aggregations = []

    keys.forEach(key => {
      const buckets = {}

      connection._nodes.forEach(card => {
        const value = getAggregationKeyValue(card, key)

        if (value) {
          if (!buckets[value]) {
            buckets[value] = []
          }

          buckets[value].push(card)
        }
      })

      aggregations.push({ key, buckets })
    })

    return aggregations
  }
}
