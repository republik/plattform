const test = require('tape-async')

const { createPrefixUrl, unprefixUrl } = require('./assets')
const repo = 'exampleRepo'

test('createPrefixUrl', (t) => {
  t.throws(() => createPrefixUrl())
  t.throws(() => createPrefixUrl(''))
  t.doesNotThrow(() => createPrefixUrl(repo))
  t.end()
})

test('skip url prefixing', (t) => {
  const url = 'asdf.jpg'
  const prefixUrl = createPrefixUrl(repo)
  t.equals(url, prefixUrl(url))
  t.end()
})

test('url prefixing and unprefixing', (t) => {
  const url = 'images/asdf.jpg'
  const prefixUrl = createPrefixUrl(repo)
  t.equals(url, unprefixUrl(prefixUrl(url)))
  t.end()
})
