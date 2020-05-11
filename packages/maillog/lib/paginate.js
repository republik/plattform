const { paginate: { paginator } } = require('@orbiting/backend-modules-utils')

const { getError } = require('./record')

const getFilterFns = ({ hasError }) => {
  const stack = []

  if (hasError === true) {
    stack.push(record => !!getError(record))
  } else if (hasError === false) {
    stack.push(record => !getError(record))
  }

  return stack
}

const paginate = (records, args) => paginator(
  { first: 100, ...args },
  a => a,
  ({ filters = {} }) => {
    const filterFns = getFilterFns(filters)

    if (filterFns.length) {
      return records.filter(record => filterFns.every(filterFn => filterFn(record)))
    }

    return records
  }
)

module.exports = {
  paginate
}
