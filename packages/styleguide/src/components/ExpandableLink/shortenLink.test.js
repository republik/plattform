import { shortenLink } from './ExpandableLinkCallout'

describe('Link shortening test', () => {
  test('shortenLink: link with query strings', () => {
    const res = shortenLink('https://example.com/foo?query=bar')
    expect(res).toBe('example.com/foo')
  })
  test('shortenLink: link without subpath with query string', () => {
    const res = shortenLink('https://example.com?query=bla')
    expect(res).toBe('example.com')
  })
  test('shortenLink: link with path and trailing forward slash', () => {
    const res = shortenLink('https://example.com/foo/')
    expect(res).toBe('example.com/foo')
  })
  test('shortenLink: link with long path and trailing forward slash', () => {
    const res = shortenLink('https://example.com/foo/bar/bli?query=bla')
    expect(res).toBe('example.com/.../bli')
  })
  test('shortenLink: trailing forward slash', () => {
    const res = shortenLink('https://example.com/')
    expect(res).toBe('example.com')
  })
  test('shortenLink: root', () => {
    const res = shortenLink('https://example.com')
    expect(res).toBe('example.com')
  })
})
