const { descending } = require('d3-array')
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
      const buckets = []

      connection._nodes.forEach(card => {
        const value = getAggregationKeyValue(card, key)

        if (value) {
          const index = buckets.findIndex(bucket => bucket.value === value)

          if (index < 0) {
            buckets.push({
              value,
              cards: [card]
            })
          } else {
            buckets[index] = {
              ...buckets[index],
              cards: buckets[index].cards.concat(card)
            }
          }
        }
      })

      aggregations.push({
        key,
        buckets:
          buckets
            .sort((a, b) => descending(a.cards.length, b.cards.length))
            .sort((a, b) => descending(
              a.cards.reduce((a, c) => a + c._mandates, 0),
              b.cards.reduce((a, c) => a + c._mandates, 0)
            ))
      })
    })

    return aggregations
  },

  medians (connection) {
    return connection._nodes
  }
}
