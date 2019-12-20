const termsAggBuilder = (fieldPath) => (key, { filter } = {}) => ({
  [`terms/${key}`]: {
    filter: filter || { match_all: {} },
    aggs: {
      terms: {
        terms: {
          field: fieldPath,
          min_doc_count: 0
        }
      }
    }
  }
})

const valueCountAggBuilder = (fieldPath) => (key, { filter } = {}) => ({
  [`valueCount/${key}`]: {
    filter: filter || { match_all: {} },
    aggs: {
      count: {
        value_count: {
          field: fieldPath
        }
      }
    }
  }
})

const trueCountAggBuilder = (fieldPath) => (key, { filter } = {}) => ({
  [`trueCount/${key}`]: {
    filter: {
      bool: {
        must: [
          filter || { match_all: {} },
          {
            term: {
              [fieldPath]: true
            }
          }
        ]
      }
    }
  }
})

const existsCountAggBuilder = (fieldPath) => (key, { filter } = {}) => ({
  [`existsCount/${key}`]: {
    filter: {
      bool: {
        must: [
          filter || { match_all: {} },
          {
            exists: {
              field: fieldPath
            }
          }
        ]
      }
    }
  }
})

const rangeAggBuilder = (fieldPath) => (key, { filter, ranges } = {}) => ({
  [`range/${key}`]: {
    filter: filter || { match_all: {} },
    aggs: {
      ranges: {
        range: {
          field: fieldPath,
          ranges
        }
      }
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
          ...schemaEntry.agg(key, schemaEntry.options || {})
        }
      }
      return aggs
    },
    {}
  )

module.exports = {
  termsAggBuilder,
  valueCountAggBuilder,
  trueCountAggBuilder,
  existsCountAggBuilder,
  rangeAggBuilder,
  extractAggs
}
