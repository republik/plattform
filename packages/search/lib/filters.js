const debug = require('debug')('search:lib:filters')
const crypto = require('crypto')
const _ = require('lodash')

const termCriteriaBuilder = (fieldName) => (value, options) => ({
  clause: options && options.not ? 'must_not' : 'must',
  filter: {
    ..._.isArray(value)
      ? { terms: { [fieldName]: [...new Set(value)] } }
      : { term: { [fieldName]: value } }
  }
})

const hasCriteriaBuilder = (fieldName) =>
  (value, { filter, not = false }) => ({
    clause: not || (!value) ? 'must_not' : 'must',
    filter: [
      filter || { match_all: {} },
      {
        exists: {
          field: fieldName
        }
      }
    ]
  })

const dateRangeCriteriaBuilder = (fieldName) =>
  (range, { filter, not = false }) => ({
    clause: not ? 'must_not' : 'must',
    filter: [
      filter || { match_all: {} },
      {
        range: {
          [fieldName]: {
            ...range.from ? { gte: range.from } : {},
            ...range.to ? { lte: range.to } : {}
          }
        }
      }
    ]
  })

const rangeCriteriaBuilder = (fieldName) =>
  (value, { filter, ranges }) => {
    const range = ranges.find(range => range.key === value.toLowerCase())

    return {
      clause: 'must',
      filter: [
        filter || { match_all: {} },
        {
          range: {
            [fieldName]: {
              gte: range.from || undefined,
              lte: range.to || undefined
            }
          }
        }
      ]
    }
  }

// converts a filter array (with generic value as string) to a (typed) filter obj
// adds a type filter if the schema implies it and no type filter
// is explicitly added
const filterReducer = (schema) => (filters) => {
  const getFilter = (key, value, not) => {
    const filterData = {
      key,
      value,
      options: { not }
    }
    debug('filterData', filterData)
    const filterHash = key + crypto
      .createHash('md5')
      .update(JSON.stringify(filterData))
      .digest('hex')
    return {
      [filterHash]: filterData
    }
  }

  let impliedType
  const typeFilter = filters.find(f => f.key === 'type')
  let filter = filters.reduce(
    (filterObj, { key, value, not }) => {
      debug('filterReducer', { key, value, not })

      const schemaEntry = schema[key]
      debug('schemaEntry', schema[key])
      if (!schemaEntry) {
        console.warn('missing schemaEntry for filter:', { key, value })
        return filterObj
      }

      const filterValue = schemaEntry.parser
        ? schemaEntry.parser(value)
        : value

      if (filterValue === undefined) {
        return filterObj
      }

      if (key !== 'type' &&
        !typeFilter &&
        (not === undefined || !not)
      ) {
        if (impliedType && impliedType !== schema.__type) {
          throw new Error('filterReducer: filter imply contradicting types', filters, schema)
        }
        impliedType = schema.__type
      }

      return {
        ...filterObj,
        ...getFilter(key, filterValue, not)
      }
    },
    {}
  )
  if (impliedType) {
    filter = {
      ...filter,
      ...getFilter('type', impliedType)
    }
  }
  return filter
}

// converts the filter (from filterReducer) into an object without the md5 hashes
const getFilterObj = (filter) => {
  const obj = {}
  filter && Object.keys(filter)
    .forEach(fKey => {
      const filterEntry = filter[fKey]
      obj[filterEntry.key] = filterEntry.value
    })
  return obj
}

// get a value from the filter (from filterReducer)
const getFilterValue = (filter, key) => {
  let value
  filter && Object.keys(filter)
    .some(fKey => {
      const filterEntry = filter[fKey]
      if (filterEntry.key === key) {
        value = filterEntry.value
      }
      return !!value
    })
  return value
}

// converts a filter obj to elastic syntax
const elasticFilterBuilder = (schema) => (filterInput) => {
  return {
    bool: Object.keys(filterInput).reduce(
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
}

module.exports = {
  termCriteriaBuilder,
  hasCriteriaBuilder,
  dateRangeCriteriaBuilder,
  rangeCriteriaBuilder,
  filterReducer,
  getFilterValue,
  getFilterObj,
  elasticFilterBuilder
}
