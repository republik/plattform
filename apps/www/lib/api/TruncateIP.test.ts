import truncateIP from './TruncateIP'

describe('truncateIP test-suite', () => {
  test('trunkates valid ip4', () => {
    expect(truncateIP('82.197.167.186')).toBe('82.197.167.0')
    expect(truncateIP('1.0.0.1')).toBe('1.0.0.0')
  })

  test('trunkates valid ip6', () => {
    expect(truncateIP('2a02:168:2112:1:9cc1:a103:eeee:ffce')).toBe(
      '2a02:168:2112:1:9cc1:a103:0:0',
    )
  })

  test('trunkates already trunkated ip6', () => {
    expect(truncateIP('2a02:168:2112:1:9cc1:a103:0:0')).toBe(
      '2a02:168:2112:1:9cc1:a103:0:0',
    )
  })

  test('throws if not valid IP', () => {
    expect(() => {
      truncateIP('random-string')
    }).toThrow()
  })
})
