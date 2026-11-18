const useragent = require('../../lib/useragent')

describe('useragent', () => {
  const chrome =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  it('detects a normal browser and the app', () => {
    expect(useragent.detect(chrome)).toMatch(/Chrome 120/)
    expect(useragent.detect(undefined)).toBeUndefined()
    expect(useragent.isApp('RepublikApp/2.1.0/5 iOS')).toBe(true)
    expect(useragent.isApp(chrome)).toBe(false)
    expect(useragent.detect('RepublikApp/2.1.0/5 iOS')).toMatch(
      /^Republik App 2\.1\.0/,
    )
  })

  it('truncates oversized input before parsing', () => {
    const huge = chrome + ' '.repeat(100000) + 'a'.repeat(100000)
    const started = Date.now()
    expect(() => useragent.detect(huge)).not.toThrow()
    expect(Date.now() - started).toBeLessThan(1000)
    // anything beyond the limit is ignored
    expect(useragent.isApp(' '.repeat(600) + 'RepublikApp/1.0')).toBe(false)
  })
})
