/**
 * Helper to apply a PostgresInterval object to a given
 * date by either adding or substracting interval. Returns
 * a moment object.
 *
 * @example add('2018-01-01', <PostgresInterval>)
 */

const moment = require('moment')

const ALLOWED_MUTATIONS = ['add', 'subtract']

const mutate = (date, interval, mutation) => {
  if (!ALLOWED_MUTATIONS.includes(mutation)) {
    throw new Error(`mutation "${mutation}" not supported`)
  }

  if (!interval) {
    throw new Error('interval missing (should be "PostgresInterval")')
  }

  if (interval.constructor.name !== 'PostgresInterval') {
    throw new Error('unrecognized interval (should be "PostgresInterval")')
  }

  const mutatedDate = moment(date)

  // '30 days 12 hours'::interval in Postgres database is retrieved as
  // PostgresInterval object { days: 30, hours: 12 } in here. Iterating through
  // each object key and mutating count (add, subtract).
  Object.keys(interval).forEach(key => {
    // e.g. moment.add(<count>, <unit>)
    mutatedDate[mutation](interval[key], key)
  })

  return mutatedDate
}

module.exports = {
  add: (date, interval) => mutate(date, interval, 'add'),
  subtract: (date, interval) => mutate(date, interval, 'subtract')
}
