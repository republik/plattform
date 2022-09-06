import { extract } from './github'

describe('github util test-suite', () => {
  it('utils.github.extract', () => {
    const autoSlug = extract(
      'https://github.com/republik-test/article-es-ist-dezember?autoSlug',
    )
    expect(autoSlug.id).toBe('republik-test/article-es-ist-dezember')
    expect(autoSlug.name).toBe('article-es-ist-dezember')
    expect(autoSlug.query).toBe('autoSlug')

    const ref = extract(
      'https://github.com/republik-test/article-es-ist-januar',
    )
    expect(ref.id).toBe('republik-test/article-es-ist-januar')
    expect(ref.name).toBe('article-es-ist-januar')
    expect(ref.query).toBe('')

    const randomUrl = extract('https://example.com')
    expect(randomUrl).toBeNull()
  })
})
