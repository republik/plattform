const { mutate, add, subtract } = require('./applyPgInterval')

const moment = require('moment')
const postgresInterval = require('postgres-interval')

test('timezone is set to Europe/Amsterdam', () => {
  // this test file is written to expect the timezone to be Europe/Amsterdam as the developers machine is configured like that
  expect(
    moment('2018-01-01 01:00:00').toISOString()
  ).toBe(
    new Date('2018-01-01').toISOString()
  )
})

test('applyPgInterval.mutate', async () => {
  expect.assertions(11)

  const a = mutate('2018-01-01', postgresInterval('1 mon 15 days'), 'add')
  expect(a instanceof moment).toBeTruthy()
  expect(a.unix()).toBe(moment('2018-02-16').unix())

  const b = mutate('2018-01-01', postgresInterval('1 mon 15 days'), 'subtract')
  expect(b instanceof moment).toBeTruthy()
  expect(b.unix()).toBe(moment('2017-11-16').unix())

  expect(() => mutate('2018-01-01')).toThrowError(/mutation missing/)
  expect(() => mutate('2018-01-01', null, 'foobar')).toThrowError(/not supported/)

  expect(() => mutate('2018-01-01', null, 'add')).toThrowError(/interval missing/)
  expect(() => mutate('2018-01-01', 'not-an-interval', 'add')).toThrowError(/not an object/)
  expect(() => mutate('2018-01-01', {}, 'add')).toThrowError(/has no keys/)
  expect(() => mutate('2018-01-01', { foo: 'bar' }, 'add')).toThrowError(/contains invalid keys/)
  expect(() => mutate('2018-01-01', { months: 10, foo: 'bar' }, 'add')).toThrowError(/contains invalid keys/)
})

test('applyPgInterval.add', async () => {
  expect.assertions(19)

  const a = add('2018-01-01', postgresInterval('1 mon'))
  expect(a instanceof moment).toBeTruthy()
  expect(a.unix()).toBe(moment('2018-02-01').unix())

  const b = add('2018-01-01', postgresInterval('1 mon 15 days'))
  expect(b instanceof moment).toBeTruthy()
  expect(b.unix()).toBe(moment('2018-02-16').unix())

  const c = add('2018-01-01', postgresInterval('1 mon 15 days 12:00:00'))
  expect(c instanceof moment).toBeTruthy()
  expect(c.unix()).toBe(moment('2018-02-16 12:00').unix())

  const d = add(new Date('2018-01-01'), postgresInterval('1 mon'))
  expect(d instanceof moment).toBeTruthy()
  expect(d.unix()).toBe(moment('2018-02-01 01:00:00').unix())

  const e = add(moment('2018-01-01'), postgresInterval('1 mon'))
  expect(e instanceof moment).toBeTruthy()
  expect(e.unix()).toBe(moment('2018-02-01').unix())

  const f = add(moment('2018-01-01'), { months: 1 })
  expect(f instanceof moment).toBeTruthy()
  expect(f.unix()).toBe(moment('2018-02-01').unix())

  const g = add(moment('2018-01-01'), { months: 1, hours: 12, minutes: 30 })
  expect(g instanceof moment).toBeTruthy()
  expect(g.unix()).toBe(moment('2018-02-01 12:30:00').unix())

  expect(() => add('2018-01-01')).toThrowError(/interval missing/)
  expect(() => add('2018-01-01', 'not-an-interval')).toThrowError(/not an object/)
  expect(() => add('2018-01-01', {})).toThrowError(/has no keys/)
  expect(() => add('2018-01-01', { foo: 'bar' })).toThrowError(/contains invalid keys/)
  expect(() => add('2018-01-01', { months: 10, foo: 'bar' })).toThrowError(/contains invalid keys/)
})

test('applyPgInterval.subtract', async () => {
  expect.assertions(19)

  const a = subtract('2018-01-01', postgresInterval('1 mon'))
  expect(a instanceof moment).toBeTruthy()
  expect(a.unix()).toBe(moment('2017-12-01').unix())

  const b = subtract('2018-01-01', postgresInterval('1 mon 15 days'))
  expect(b instanceof moment).toBeTruthy()
  expect(b.unix()).toBe(moment('2017-11-16').unix())

  const c = subtract('2018-01-01', postgresInterval('1 mon 15 days 12:00:00'))
  expect(c instanceof moment).toBeTruthy()
  expect(c.unix()).toBe(moment('2017-11-15 12:00').unix())

  const d = subtract(new Date('2018-01-01'), postgresInterval('1 mon'))
  expect(d instanceof moment).toBeTruthy()
  expect(d.unix()).toBe(moment('2017-12-01 01:00:00').unix())

  const e = subtract(moment('2018-01-01'), postgresInterval('1 mon'))
  expect(e instanceof moment).toBeTruthy()
  expect(e.unix()).toBe(moment('2017-12-01').unix())

  const f = subtract(moment('2018-01-01'), { months: 1 })
  expect(f instanceof moment).toBeTruthy()
  expect(f.unix()).toBe(moment('2017-12-01').unix())

  const g = subtract(moment('2018-01-01'), { months: 1, hours: 12, minutes: 30 })
  expect(g instanceof moment).toBeTruthy()
  expect(g.unix()).toBe(moment('2017-11-30 11:30:00').unix())

  expect(() => subtract('2018-01-01')).toThrowError(/interval missing/)
  expect(() => subtract('2018-01-01', 'not-an-interval')).toThrowError(/not an object/)
  expect(() => subtract('2018-01-01', {})).toThrowError(/has no keys/)
  expect(() => subtract('2018-01-01', { foo: 'bar' })).toThrowError(/contains invalid keys/)
  expect(() => subtract('2018-01-01', { months: 10, foo: 'bar' })).toThrowError(/contains invalid keys/)
})
