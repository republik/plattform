const { descending } = require('d3-array')
const _ = require('lodash')

const getAggregationKeyValues = (card, key) => {
  switch (key) {
    case 'party': return [_.get(card, 'payload.party', 'UNKNOWN')]
    case 'fraction': return [_.get(card, 'payload.fraction', 'UNKNOWN')]
    case 'election': return [
      _.get(card, 'payload.nationalCouncil.elected', false) && 'nationalCouncil',
      _.get(card, 'payload.councilOfStates.elected', false) && 'councilOfStates'
    ].filter(Boolean)
    case 'nationalCouncilElection': return [_.get(card, 'payload.nationalCouncil.elected', false)]
    case 'councilOfStatesElection': return [_.get(card, 'payload.councilOfStates.elected', false)]
  }
}

module.exports = {
  aggregations (connection, args) {
    const { keys } = args

    const aggregations = []

    if (!keys || keys.length < 1) {
      return []
    }

    keys.forEach(key => {
      const buckets = []

      connection._nodes.forEach(card => {
        const values = getAggregationKeyValues(card, key)

        values.forEach(value => {
          if (value || value === false) {
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
