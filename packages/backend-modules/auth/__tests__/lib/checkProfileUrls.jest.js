const checkProfileUrls = require('../../lib/checkProfileUrls')

describe('checkProfileUrl test', () => {
  test('should return false if single url is not http or https', () => {
    expect(checkProfileUrls('javascript:void(0)')).toBe(false)
  })
  test('should return false if array of urls contains url that is not http or https', () => {
    expect(
      checkProfileUrls([
        'http://example.com',
        'https://example.com',
        'javascript:void(0)',
      ]),
    ).toBe(false)
    expect(checkProfileUrls(['http://example.com', 'ftp://example.com'])).toBe(
      false,
    )
    expect(
      checkProfileUrls(['http://example.com', 'mailto://example.com']),
    ).toBe(false)
  })
  test('should return true if array of urls only contains url that are http or https', () => {
    expect(
      checkProfileUrls(['http://example.com', 'https://example.com']),
    ).toBe(true)
  })
  test('should return true if single url is http or https', () => {
    expect(checkProfileUrls('http://example.com')).toBe(true)
    expect(checkProfileUrls('https://example.com')).toBe(true)
  })
})
