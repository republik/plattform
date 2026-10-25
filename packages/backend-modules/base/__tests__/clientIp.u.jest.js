const {
  getClientIp,
  resolveClientIp,
  getTrustProxyHops,
} = require('../lib/clientIp')

describe('resolveClientIp', () => {
  it('uses the socket address without trusted proxies', () => {
    expect(
      resolveClientIp({
        forwardedFor: '6.6.6.6',
        remoteAddress: '10.0.0.1',
        hops: 0,
      }),
    ).toBe('10.0.0.1')
  })

  it('ignores spoofed leading entries with one hop (Heroku router)', () => {
    expect(
      resolveClientIp({
        forwardedFor: '6.6.6.6, 7.7.7.7, 203.0.113.9',
        remoteAddress: '10.0.0.1',
        hops: 1,
      }),
    ).toBe('203.0.113.9')
  })

  it('handles a single entry and array headers', () => {
    expect(
      resolveClientIp({
        forwardedFor: '203.0.113.9',
        remoteAddress: 'x',
        hops: 1,
      }),
    ).toBe('203.0.113.9')
    expect(
      resolveClientIp({
        forwardedFor: ['6.6.6.6', '203.0.113.9'],
        remoteAddress: 'x',
        hops: 1,
      }),
    ).toBe('203.0.113.9')
  })

  it('counts multiple hops from the right', () => {
    expect(
      resolveClientIp({
        forwardedFor: '6.6.6.6, 203.0.113.9, 198.51.100.1',
        remoteAddress: 'x',
        hops: 2,
      }),
    ).toBe('203.0.113.9')
  })

  it('falls back to the leftmost entry if the chain is shorter than hops', () => {
    expect(
      resolveClientIp({
        forwardedFor: '203.0.113.9',
        remoteAddress: 'x',
        hops: 3,
      }),
    ).toBe('203.0.113.9')
  })

  it('falls back to the socket address, normalizes mapped IPv4', () => {
    expect(
      resolveClientIp({ remoteAddress: '::ffff:192.0.2.1', hops: 1 }),
    ).toBe('192.0.2.1')
    expect(resolveClientIp({ hops: 1 })).toBeNull()
  })
})

describe('getClientIp / getTrustProxyHops', () => {
  it('reads the request', () => {
    const req = {
      headers: { 'x-forwarded-for': '6.6.6.6, 203.0.113.9' },
      socket: { remoteAddress: '10.0.0.1' },
    }
    expect(getClientIp(req, 1)).toBe('203.0.113.9')
    expect(getClientIp(req, 0)).toBe('10.0.0.1')
  })

  it('defaults to 1 hop in production, 0 otherwise, env overrides', () => {
    expect(getTrustProxyHops({ NODE_ENV: 'production' })).toBe(1)
    expect(getTrustProxyHops({})).toBe(0)
    expect(
      getTrustProxyHops({ NODE_ENV: 'production', TRUST_PROXY_HOPS: '2' }),
    ).toBe(2)
    expect(getTrustProxyHops({ TRUST_PROXY_HOPS: '1' })).toBe(1)
    expect(
      getTrustProxyHops({ NODE_ENV: 'production', TRUST_PROXY_HOPS: 'abc' }),
    ).toBe(1)
  })
})
