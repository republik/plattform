const { termCriteriaBuilder } = require('./filters')

const { termsAggBuilder, trueCountAggBuilder } = require('./aggregations')

const boolParser = (value) => {
  if (typeof value === 'string') {
    return value.toString() === 'true'
  }

  // eslint-disable-next-line eqeqeq
  return value == true
}

const dateRangeParser = (value) => {
  // An object value = { from: "", to: "" }
  if (value.from || value.to) {
    return {
      from: value.from && new Date(value.from),
      to: value.to && new Date(value.to),
    }
  }

  // A string, maybe separated by comma
  const [from, to] =
    value.indexOf(',') > -1 ? value.split(',') : [undefined, value]

  return {
    from: from && new Date(from),
    to: to && new Date(to),
  }
}

const createEntry = (criteriaBuilder, aggBuilder, additionals) => (
  fieldPath,
) => ({
  criteria: criteriaBuilder(fieldPath),
  agg: aggBuilder(fieldPath),
  ...additionals,
})

const termEntry = createEntry(termCriteriaBuilder, termsAggBuilder)
const countEntry = createEntry(termCriteriaBuilder, trueCountAggBuilder, {
  parser: boolParser,
})

module.exports = {
  createEntry,
  termEntry,
  countEntry,
  boolParser,
  dateRangeParser,
}
