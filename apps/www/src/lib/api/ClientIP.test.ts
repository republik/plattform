import { getTrustProxyHops, resolveClientIP } from './ClientIP'

describe('resolveClientIP', () => {
  test('ignores spoofed leading entries with one trusted hop', () => {
    expect(resolveClientIP('6.6.6.6, 7.7.7.7, 203.0.113.9', '10.0.0.1', 1)).toBe(
      '203.0.113.9',
    )
    expect(resolveClientIP(['6.6.6.6', '203.0.113.9'], undefined, 1)).toBe(
      '203.0.113.9',
    )
  })

  test('uses the socket address without trusted hops', () => {
    expect(resolveClientIP('6.6.6.6', '10.0.0.1', 0)).toBe('10.0.0.1')
  })

  test('counts multiple hops from the right', () => {
    expect(resolveClientIP('6.6.6.6, 203.0.113.9, 198.51.100.1', null, 2)).toBe(
      '203.0.113.9',
    )
  })

  test('returns null if nothing is known', () => {
    expect(resolveClientIP(undefined, undefined, 1)).toBeNull()
  })
})

describe('getTrustProxyHops', () => {
  test('defaults and overrides', () => {
    expect(getTrustProxyHops({ NODE_ENV: 'production' })).toBe(1)
    expect(getTrustProxyHops({})).toBe(0)
    expect(getTrustProxyHops({ TRUST_PROXY_HOPS: '2' })).toBe(2)
    expect(
      getTrustProxyHops({ NODE_ENV: 'production', TRUST_PROXY_HOPS: 'x' }),
    ).toBe(1)
  })
})
