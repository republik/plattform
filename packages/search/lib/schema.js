const {
  hasCriteriaBuilder,
  termCriteriaBuilder
} = require('./filters')

const {
  termAggBuilder,
  valueCountAggBuilder
} = require('./aggregations')

// eslint-disable-next-line eqeqeq
const boolParser = (value) => value == true

const createEntry = (criteriaBuilder, aggBuilder, additionals) => (fieldPath) => ({
  criteria: criteriaBuilder(fieldPath),
  agg: aggBuilder(fieldPath),
  ...additionals
})

const termEntry = createEntry(termCriteriaBuilder, termAggBuilder)
const countEntry = createEntry(hasCriteriaBuilder, valueCountAggBuilder, { parser: boolParser })

module.exports = {
  createEntry,
  termEntry,
  countEntry
}
