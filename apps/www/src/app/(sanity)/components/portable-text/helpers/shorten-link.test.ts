import { shortenLink } from './shorten-link'

describe('shortenLink', () => {
  test('link with query strings', () => {
    expect(shortenLink('https://example.com/foo?query=bar')).toBe(
      'example.com/foo',
    )
  })

  test('link without subpath with query string', () => {
    expect(shortenLink('https://example.com?query=bla')).toBe('example.com')
  })

  test('link with path and trailing forward slash', () => {
    expect(shortenLink('https://example.com/foo/')).toBe('example.com/foo')
  })

  test('link with long path and trailing forward slash', () => {
    expect(shortenLink('https://example.com/foo/bar/bli?query=bla')).toBe(
      'example.com/.../bli',
    )
  })

  test('trailing forward slash', () => {
    expect(shortenLink('https://example.com/')).toBe('example.com')
  })

  test('root', () => {
    expect(shortenLink('https://example.com')).toBe('example.com')
  })

  test('returns the string as is if it is not a link', () => {
    expect(shortenLink('my link will go here')).toBe('my link will go here')
  })

  test('returns undefined without a url', () => {
    expect(shortenLink(undefined)).toBeUndefined()
  })

  test('resolves a root-relative path against a base', () => {
    expect(
      shortenLink('/2025/02/20/an-article', 'https://www.republik.ch'),
    ).toBe('www.republik.ch/.../an-article')
  })

  test('a base does not override an absolute url', () => {
    expect(
      shortenLink('https://example.com/foo', 'https://www.republik.ch'),
    ).toBe('example.com/foo')
  })

  test('a root-relative path without a base is returned unchanged', () => {
    expect(shortenLink('/2025/02/20/an-article')).toBe('/2025/02/20/an-article')
  })
})
