import { expandIPv6 } from './IPv6Helpers'

describe('IPv6Helpers test-suite', () => {
  test('expand IPv6 address', () => {
    expect(expandIPv6('::1')).toBe('0:0:0:0:0:0:0:1')
    expect(expandIPv6('1:2:3::1')).toBe('1:2:3:0:0:0:0:1')
    expect(expandIPv6('1:2:3:4:5:6:7:8')).toBe('1:2:3:4:5:6:7:8')
    expect(expandIPv6('1:2:3:4:5:6:7::')).toBe('1:2:3:4:5:6:7:0')
    expect(expandIPv6('2001:db8:6:bbb0::7')).toBe('2001:db8:6:bbb0:0:0:0:7')
  })
})
