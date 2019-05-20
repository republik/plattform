/**
 * Helper to apply a PostgresInterval object (or similar) to
 * a given date by either adding or substracting interval. Returns
 * a moment object.
 *
 * @example add('2018-01-01', <PostgresInterval>)
 * @example subtract('2018-01-01', <PostgresInterval>)
 * @example mutate('2018-01-01', <PostgresInterval>, 'add')
 */

const moment = require('moment')

const ALLOWED_MUTATIONS = ['add', 'subtract']

// @see https://github.com/bendrucker/postgres-interval/blob/master/index.js
const ALLOWED_INTERVAL_KEYS = [
  'years',
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds'
]

const mutate = (date, interval, mutation) => {
  if (!mutation) {
    throw new Error(`mutation missing`)
  }

  if (!ALLOWED_MUTATIONS.includes(mutation)) {
    throw new Error(`mutation "${mutation}" not supported`)
  }

  if (!interval) {
    throw new Error('interval missing')
  }

  if (typeof interval !== 'object') {
    throw new Error('interval not an object')
  }

  const keys = Object.keys(interval)

  if (keys.length < 1) {
    throw new Error('interval object has no keys')
  }

  if (keys.filter(key => ALLOWED_INTERVAL_KEYS.includes(key)).length !== keys.length) {
    throw new Error('interval object contains invalid keys')
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
  mutate,
  add: (date, interval) => mutate(date, interval, 'add'),
  subtract: (date, interval) => mutate(date, interval, 'subtract')
}
