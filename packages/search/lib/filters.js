const debug = require('debug')('search:lib:filters')

const termCriteriaBuilder = (fieldName) => (value) => ({
  clause: 'must',
  filter: {
    term: { [fieldName]: value }
  }
})

const hasCriteriaBuilder = (fieldName) => (value) => ({
  clause: value ? 'must' : 'must_not',
  filter: {
    exists: {
      field: fieldName
    }
  }
})

const dateRangeCriteriaBuilder = (fieldName) => (range) => ({
  clause: 'must',
  filter: {
    range: {
      [fieldName]: {
        gte: range.from,
        lte: range.to
      }
    }
  }
})

const rangeCriteriaBuilder = (fieldName) => (value, { ranges }) => {
  debug('rangeCriteriaBuilder', fieldName, value, ranges)
  const range = ranges.find(range => range.key === value)
  debug('rangeCriteriaBuilder', range)

  return {
    clause: 'must',
    filter: {
      range: {
        [fieldName]: {
          gte: range.from || undefined,
          lte: range.to || undefined
        }
      }
    }
  }
}

/*
const dateCriteriaBuilder = (fieldName, operator) => (date) => ({
  clause: 'must',
  filter: {
    range: {
      [fieldName]: {
        [operator]: date
      }
    }
  }
})
*/

// converts a filter array (with generic value as string) to a (typed) filter obj
const filterReducer = (schema) => (filters) =>
  filters.reduce(
    (filterObj, { key, value }) => {
      debug('filterReducer', { key, value })
      const schemaEntry = schema[key]
      debug('schemaEntry', schema[key])
      if (!schemaEntry) {
        console.warn('missing schemaEntry for filter:', { key, value })
        return filterObj
      }

      // debug('schemaEntry.parser', schemaEntry.parser(value))

      return {
        ...filterObj,
        [key]: schemaEntry.parser
          ? schemaEntry.parser(value)
          : value
      }
    },
    {}
  )

// converts a filter obj to elastic syntax
const elasticFilterBuilder = (schema) => (filterInput) =>
  Object.keys(filterInput).reduce(
    (boolFilter, key) => {
      const schemaEntry = schema[key]
      if (!schemaEntry) {
        throw new Error(`Missing schemaEntry for filter: ${key}`)
      }
      const criteria = schemaEntry.criteria
      if (!criteria) {
        throw new Error(`Missing criteria for filter: ${key}`)
      }

      const value = filterInput[key]
      const created = criteria(value, schemaEntry.options || null)
      boolFilter[created.clause] = [
        ...(boolFilter[created.clause] || []),
        created.filter
      ]
      return boolFilter
    },
    {}
  )

module.exports = {
  termCriteriaBuilder,
  hasCriteriaBuilder,
  dateRangeCriteriaBuilder,
  rangeCriteriaBuilder,
  filterReducer,
  elasticFilterBuilder
}
