const UUT = require('./fakeUUID')

/**
 * @todo Show snapshot update process when hash algo is changed
 * to "sha256".
 */

describe('fakeUUID()', () => {
  test('seed "a"', () => {
    expect(UUT('a')).toMatchSnapshot()
  })

  test('seed "Lorem ipsum"', () => {
    expect(UUT('Lorem ipsum')).toMatchSnapshot()
  })

  test('same seed returns same UUID', () => {
    const uuid1 = UUT('some seed')
    const uuid2 = UUT('some seed')

    expect(uuid1).toEqual(uuid2)
  })

  test('faulty argument throws TypeError', () => {
    expect(() => UUT(123)).toThrowErrorMatchingSnapshot()
    expect(() => UUT({ foo: 'bar' })).toThrowErrorMatchingSnapshot()
  })
})
