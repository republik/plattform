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

const rangeAggBuilder = (fieldPath) => (key, { ranges }) => ({
  [key]: {
    range: {
      field: fieldPath,
      ranges
    }
  }
})

const extractAggs = (schema) =>
  Object.keys(schema).reduce(
    (aggs, key) => {
      const schemaEntry = schema[key]
      if (schemaEntry.agg) {
        return {
          ...aggs,
          ...schemaEntry.agg(key, schemaEntry.options || null)
        }
      }
      return aggs
    },
    {}
  )

module.exports = {
  termAggBuilder,
  valueCountAggBuilder,
  rangeAggBuilder,
  extractAggs
}
