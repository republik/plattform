const debug = require('debug')('search:lib:filters')
const crypto = require('crypto')

const termCriteriaBuilder = (fieldName) => (value, options) => ({
  clause: options && options.not ? 'must_not' : 'must',
  filter: {
    term: { [fieldName]: value }
  }
})

const hasCriteriaBuilder = (fieldName) => (value, options) => ({
  clause: options && options.not ? 'must_not' : 'must',
  filter: {
    exists: {
      field: fieldName
    }
  }
})

const dateRangeCriteriaBuilder = (fieldName) => (range, options) => ({
  clause: options && options.not ? 'must_not' : 'must',
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
  const range = ranges.find(range => range.key === value.toLowerCase())

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
    (filterObj, { key, value, not }) => {
      debug('filterReducer', { key, value, not })

      const schemaEntry = schema[key]
      debug('schemaEntry', schema[key])
      if (!schemaEntry) {
        console.warn('missing schemaEntry for filter:', { key, value })
        return filterObj
      }

      const filterValue = schemaEntry.parser ? schemaEntry.parser(value) : value

      if (!filterValue) {
        not = true
      }

      const filterData = {
        key,
        value: filterValue,
        options: { not }
      }

      debug('filterData', filterData)

      const filterHash = key + crypto
        .createHash('md5')
        .update(JSON.stringify(filterData))
        .digest('hex')

      return {
        ...filterObj,
        [filterHash]: filterData
      }
    },
    {}
  )

// converts a filter obj to elastic syntax
const elasticFilterBuilder = (schema) => (filterInput) => {
  debug('elasticFilterBuilder', filterInput)
  return Object.keys(filterInput).reduce(
    (boolFilter, hash) => {
      const { key, value, options } = filterInput[hash]

      const schemaEntry = schema[key]
      if (!schemaEntry) {
        throw new Error(`Missing schemaEntry for filter: ${key}`)
      }

      const criteria = schemaEntry.criteria
      if (!criteria) {
        throw new Error(`Missing criteria for filter: ${key}`)
      }

      const created = criteria(
        value,
        Object.assign(
          {},
          schemaEntry.options,
          options
        )
      )

      boolFilter[created.clause] = [
        ...(boolFilter[created.clause] || []),
        created.filter
      ]

      return boolFilter
    },
    {}
  )
}

module.exports = {
  termCriteriaBuilder,
  hasCriteriaBuilder,
  dateRangeCriteriaBuilder,
  rangeCriteriaBuilder,
  filterReducer,
  elasticFilterBuilder
}
