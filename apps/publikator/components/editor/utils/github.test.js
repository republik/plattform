import { extract, setOrg } from './github'

setOrg('republik-test')

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

    // cross-enf
    const wrongOrg = extract(
      'https://github.com/republik/article-es-ist-januar',
    )
    expect(wrongOrg).toBeNull()

    const randomUrl = extract('https://example.com')
    expect(randomUrl).toBeNull()
  })
})
