const test = require('tape-async')
const { add, subtract } = require('../applyPgInterval')

const moment = require('moment')
const postgresInterval = require('postgres-interval')

test('applyPgInterval.add', async (t) => {
  const a = add('2018-01-01', postgresInterval('1 mon'))
  t.ok(a instanceof moment, 'returns moment object')
  t.equal(a.unix(), moment('2018-02-01').unix(), 'add month')

  const b = add('2018-01-01', postgresInterval('1 mon 15 days'))
  t.ok(b instanceof moment, 'returns moment object')
  t.equal(b.unix(), moment('2018-02-16').unix(), 'add month and 15 days')

  const c = add('2018-01-01', postgresInterval('1 mon 15 days 12:00:00'))
  t.ok(c instanceof moment, 'returns moment object')
  t.equal(c.unix(), moment('2018-02-16 12:00').unix(), 'add month, 15 days and 12 hours')

  const d = add(new Date('2018-01-01'), postgresInterval('1 mon'))
  t.ok(d instanceof moment, 'returns moment object')
  t.equal(d.unix(), moment('2018-02-01 01:00:00').unix(), 'accepts Date()')

  const e = add(moment('2018-01-01'), postgresInterval('1 mon'))
  t.ok(e instanceof moment, 'returns moment object')
  t.equal(e.unix(), moment('2018-02-01').unix(), 'accepts moment()')

  t.throws(() => add('2018-01-01', 'not-an-interval'), /unrecognized.*PostgresInterval/, 'interval unrecognized')
  t.throws(() => add('2018-01-01'), /missing.*PostgresInterval/, 'interval missing')

  t.end()
})

test.only('applyPgInterval.subtract', async (t) => {
  const a = subtract('2018-01-01', postgresInterval('1 mon'))
  t.ok(a instanceof moment, 'returns moment object')
  t.equal(a.unix(), moment('2017-12-01').unix(), 'substract month')

  const b = subtract('2018-01-01', postgresInterval('1 mon 15 days'))
  t.ok(b instanceof moment, 'returns moment object')
  t.equal(b.unix(), moment('2017-11-16').unix(), 'subtract month and 15 days')

  const c = subtract('2018-01-01', postgresInterval('1 mon 15 days 12:00:00'))
  t.ok(c instanceof moment, 'returns moment object')
  t.equal(c.unix(), moment('2017-11-15 12:00').unix(), 'subtract month, 15 days and 12 hours')

  const d = subtract(new Date('2018-01-01'), postgresInterval('1 mon'))
  t.ok(d instanceof moment, 'returns moment object')
  t.equal(d.unix(), moment('2017-12-01 01:00:00').unix(), 'accepts Date()')

  const e = subtract(moment('2018-01-01'), postgresInterval('1 mon'))
  t.ok(e instanceof moment, 'returns moment object')
  t.equal(e.unix(), moment('2017-12-01').unix(), 'accepts moment()')

  t.throws(() => subtract('2018-01-01', 'not-an-interval'), /unrecognized.*PostgresInterval/, 'interval unrecognized')
  t.throws(() => subtract('2018-01-01'), /missing.*PostgresInterval/, 'interval missing')

  t.end()
})
