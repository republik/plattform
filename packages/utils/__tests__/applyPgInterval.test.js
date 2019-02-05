const test = require('tape-async')
const { mutate, add, subtract } = require('../applyPgInterval')

const moment = require('moment')
const postgresInterval = require('postgres-interval')

test('applyPgInterval.mutate', async (t) => {
  t.plan(11)

  const a = mutate('2018-01-01', postgresInterval('1 mon 15 days'), 'add')
  t.ok(a instanceof moment, 'returns moment object')
  t.equal(a.unix(), moment('2018-02-16').unix(), 'add month and 15 days')

  const b = mutate('2018-01-01', postgresInterval('1 mon 15 days'), 'subtract')
  t.ok(b instanceof moment, 'returns moment object')
  t.equal(b.unix(), moment('2017-11-16').unix(), 'subtract month')

  t.throws(() => mutate('2018-01-01'), /mutation missing/, 'mutation missing')
  t.throws(() => mutate('2018-01-01', null, 'foobar'), /not supported/, 'mutation not supported')

  t.throws(() => mutate('2018-01-01', null, 'add'), /interval missing/, 'interval missing')
  t.throws(() => mutate('2018-01-01', 'not-an-interval', 'add'), /not an object/, 'interval not an object')
  t.throws(() => mutate('2018-01-01', {}, 'add'), /has no keys/, 'interval object has no keys')
  t.throws(() => mutate('2018-01-01', { foo: 'bar' }, 'add'), /contains invalid keys/, 'interval contains invalid keys')
  t.throws(() => mutate('2018-01-01', { months: 10, foo: 'bar' }, 'add'), /contains invalid keys/, 'interval contains invalid keys')

  t.end()
})

test('applyPgInterval.add', async (t) => {
  t.plan(19)

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

  const f = add(moment('2018-01-01'), { months: 1 })
  t.ok(f instanceof moment, 'returns moment object')
  t.equal(f.unix(), moment('2018-02-01').unix(), 'accepts object interval { months }')

  const g = add(moment('2018-01-01'), { months: 1, hours: 12, minutes: 30 })
  t.ok(g instanceof moment, 'returns moment object')
  t.equal(g.unix(), moment('2018-02-01 12:30:00').unix(), 'accepts object interval { months, hours, minutes }')

  t.throws(() => add('2018-01-01'), /interval missing/, 'interval missing')
  t.throws(() => add('2018-01-01', 'not-an-interval'), /not an object/, 'interval not an object')
  t.throws(() => add('2018-01-01', {}), /has no keys/, 'interval object has no keys')
  t.throws(() => add('2018-01-01', { foo: 'bar' }), /contains invalid keys/, 'interval contains invalid keys')
  t.throws(() => add('2018-01-01', { months: 10, foo: 'bar' }), /contains invalid keys/, 'interval contains invalid keys')

  t.end()
})

test('applyPgInterval.subtract', async (t) => {
  t.plan(19)

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

  const f = subtract(moment('2018-01-01'), { months: 1 })
  t.ok(f instanceof moment, 'returns moment object')
  t.equal(f.unix(), moment('2017-12-01').unix(), 'accepts object interval { months }')

  const g = subtract(moment('2018-01-01'), { months: 1, hours: 12, minutes: 30 })
  t.ok(g instanceof moment, 'returns moment object')
  t.equal(g.unix(), moment('2017-11-30 11:30:00').unix(), 'accepts object interval { months, hours, minutes }')

  t.throws(() => subtract('2018-01-01'), /interval missing/, 'interval missing')
  t.throws(() => subtract('2018-01-01', 'not-an-interval'), /not an object/, 'interval not an object')
  t.throws(() => subtract('2018-01-01', {}), /has no keys/, 'interval object has no keys')
  t.throws(() => subtract('2018-01-01', { foo: 'bar' }), /contains invalid keys/, 'interval contains invalid keys')
  t.throws(() => subtract('2018-01-01', { months: 10, foo: 'bar' }), /contains invalid keys/, 'interval contains invalid keys')

  t.end()
})
