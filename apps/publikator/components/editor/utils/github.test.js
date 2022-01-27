import test from 'tape'
import { extract, setOrg } from './github'

setOrg('republik-test')

test('utils.github.extract', assert => {
  const autoSlug = extract(
    'https://github.com/republik-test/article-es-ist-dezember?autoSlug'
  )
  assert.equal(autoSlug.id, 'republik-test/article-es-ist-dezember')
  assert.equal(autoSlug.name, 'article-es-ist-dezember')
  assert.equal(autoSlug.query, 'autoSlug')

  const ref = extract('https://github.com/republik-test/article-es-ist-januar')
  assert.equal(ref.id, 'republik-test/article-es-ist-januar')
  assert.equal(ref.name, 'article-es-ist-januar')
  assert.equal(ref.query, '')

  // cross-enf
  const wrongOrg = extract('https://github.com/republik/article-es-ist-januar')
  assert.equal(wrongOrg, null)

  const randomUrl = extract('https://example.com')
  assert.equal(randomUrl, null)

  assert.end()
})
