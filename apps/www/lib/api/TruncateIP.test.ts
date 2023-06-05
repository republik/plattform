import truncateIP from './TruncateIP'

describe('truncateIP test-suite', () => {
  test('trunkates valid ip4', () => {
    expect(truncateIP('82.197.167.186')).toBe('82.197.167.0')
    expect(truncateIP('1.0.0.1')).toBe('1.0.0.0')
  })

  test('trunkates valid ip6', () => {
    expect(truncateIP('1:2:3::1')).toBe('1:2:3:0:0:0:0:0')
    expect(truncateIP('1:2:3:4:5:6:7:8')).toBe('1:2:3:0:0:0:0:0')
    expect(truncateIP('1:2:3:4:5:6:7::')).toBe('1:2:3:0:0:0:0:0')
    expect(truncateIP('2001:db8:6:bbb0::7')).toBe('2001:db8:6:0:0:0:0:0')
  })

  test('array of IPs', () => {
    expect(truncateIP(['82.197.167.186', 'other-string'])).toBe('82.197.167.0')
  })

  test('string with multiple IPs', () => {
    expect(truncateIP('82.197.167.186, other-string')).toBe('82.197.167.0')
  })

  test('throws if not valid IP', () => {
    expect(() => {
      truncateIP('random-string')
    }).toThrow()
  })
})
