require('dotenv').config({ path: '.test.env' })

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

test('oneway', (t) => {
  const url = 'images/asdf.jpg?test=true'
  const prefixUrl = createPrefixUrl(repo, true)
  const newUrl = prefixUrl(url)
  t.equals(-1, newUrl.indexOf('#'))
  t.equals(newUrl, unprefixUrl(newUrl))
  t.end()
})

test('originalURL', (t) => {
  const url = 'http://host.ch/images/asdf.jpg#originalURL=test'
  t.equals(unprefixUrl(url), 'test')
  t.end()
})
