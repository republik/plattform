const termAggBuilder = (fieldPath) => (key) => ({
  [key]: {
    terms: {
      field: fieldPath
    }
  }
})

const valueCountAggBuilder = (fieldPath) => (key) => ({
  [key]: {
    value_count: {
      field: fieldPath
    }
  }
})

const createElasticAggs = (schema) =>
  Object.keys(schema).reduce(
    (aggs, key) => {
      const schemaEntry = schema[key]
      if (!schemaEntry) {
        throw new Error(`Missing filter schemaEntry for agg: ${key}`)
      }
      if (schemaEntry.agg) {
        return {
          ...aggs,
          ...schemaEntry.agg
        }
      }
      return aggs
    },
    {}
  )

module.exports = {
  termAggBuilder,
  valueCountAggBuilder,
  createElasticAggs
}
