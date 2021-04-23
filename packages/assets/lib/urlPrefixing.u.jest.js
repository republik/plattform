process.env.ASSETS_SERVER_BASE_URL = 'http://domain.tld'
process.env.AWS_S3_BUCKET = 'some-bucket'
process.env.ASSETS_HMAC_KEY = 'foobar'

const {
  createRepoUrlPrefixer,
  createRepoUrlUnprefixer,
  createProxyUrlPrefixer,
} = require('./urlPrefixing')
const repoId = 'repo-namespace/repo-name'

describe('createRepoUrlPrefixer()', () => {
  it('throws when repoId arg is bad', () => {
    expect(() => createRepoUrlPrefixer()).toThrow()
    expect(() => createRepoUrlPrefixer('')).toThrow()
  })

  it('does not throw when repoId arg is ok', () => {
    expect(() => createRepoUrlPrefixer(repoId)).not.toThrow()
  })

  it('does not throw when repoId arg is ok', () => {
    expect(() => createRepoUrlPrefixer(repoId)).not.toThrow()
  })

  it('prefixes url', () => {
    const url = 'images/asdf.jpg?test=true'
    const prefix = createRepoUrlPrefixer(repoId)
    const prefixedUrl = prefix(url)

    expect(prefixedUrl).toMatch(url)
    expect(prefixedUrl).toMatch(/^http/)
    expect(prefixedUrl.indexOf('#originalURL')).toBeTruthy()
  })

  it('passes through url', () => {
    const url = 'asdf.jpg'
    const prefix = createRepoUrlPrefixer(repoId)
    expect(url).toBe(prefix(url))
  })
})

describe('createRepoUrlUnprefixer', () => {
  it('throws when repoId arg is bad', () => {
    expect(() => createRepoUrlUnprefixer()).toThrow()
    expect(() => createRepoUrlUnprefixer('')).toThrow()
  })

  it('does not throw when repoId arg is ok', () => {
    expect(() => createRepoUrlUnprefixer(repoId)).not.toThrow()
  })

  it('restores original url', () => {
    const url =
      'http://domain.tld/repo-namespace/repo-name/images/asdf.jpg#originalURL=images%2Fasdf.jpg'
    const unprefix = createRepoUrlUnprefixer(repoId)
    expect(unprefix(url)).toBe('images/asdf.jpg')
  })

  it('restores original url when domain is foreign', () => {
    const url =
      'http://foobar.tld/path/repo-namespace/repo-name/images/asdf.jpg#originalURL=images%2Fasdf.jpg'
    const unprefix = createRepoUrlUnprefixer(repoId)
    expect(unprefix(url)).toBe('images/asdf.jpg')
  })

  it('pass through when #originalURL contains no "images/"', () => {
    const url =
      'http://domain.tld/repo-namespace/repo-name/images/asdf.jpg#originalURL=some%2Fpath'
    const unprefix = createRepoUrlUnprefixer(repoId)
    expect(unprefix(url)).toBe(url)
  })

  it('pass through when repoId does not match', () => {
    const url =
      'http://domain.tld/repo-namespace/some-other-repo/images/asdf.jpg#originalURL=images%2Fasdf.jpg'
    const unprefix = createRepoUrlUnprefixer(repoId)
    expect(unprefix(url)).toBe(url)
  })
})

describe('createProxyUrlPrefixer', () => {
  it('returns proxy url', () => {
    const url = 'http://random.example.tld/some/random/url'
    const expectedUrl =
      'http://domain.tld/proxy?originalURL=http%3A%2F%2Frandom.example.tld%2Fsome%2Frandom%2Furl&mac=71b96262b20ef3f976e16b2029d687b9cc30c434c9864c415ce9b305c8a76a72'
    const proxy = createProxyUrlPrefixer()
    expect(proxy(url)).toBe(expectedUrl)
  })

  it('returns proxy url with complex url', () => {
    const url = 'https://random.example.tld/some/random/url?foo=bar#hans-joerg'
    const expectedUrl =
      'http://domain.tld/proxy?originalURL=https%3A%2F%2Frandom.example.tld%2Fsome%2Frandom%2Furl%3Ffoo%3Dbar%23hans-joerg&mac=0644439067949a004bdce732ea566ac3ad987aaf5c05cab794f92fa84c9a7cd3'
    const proxy = createProxyUrlPrefixer()
    expect(proxy(url)).toBe(expectedUrl)
  })

  it('passes through url if data', () => {
    const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUxxx'
    const proxy = createProxyUrlPrefixer()
    expect(proxy(url)).toBe(url)
  })

  it('passes through url if proxy', () => {
    const url = 'http://domain.tld/proxy?originalURL=123&mac=123'
    const proxy = createProxyUrlPrefixer()
    expect(proxy(url)).toBe(url)
  })

  it('passes through url does not start with "http"', () => {
    const url = 'images/asdf.jpg?test=true'
    const proxy = createProxyUrlPrefixer()
    expect(proxy(url)).toBe(url)
  })
})
