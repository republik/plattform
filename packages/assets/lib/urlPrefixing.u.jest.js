process.env.ASSETS_SERVER_BASE_URL = 'http://example.com'

const { createRepoUrlPrefixer, unprefixUrl } = require('./urlPrefixing')
const repo = 'exampleRepo'

test('createRepoUrlPrefixer', () => {
  expect(() => createRepoUrlPrefixer()).toThrow()
  expect(() => createRepoUrlPrefixer('')).toThrow()
  expect(() => createRepoUrlPrefixer(repo)).not.toThrow()
})

test('skip url prefixing', () => {
  const url = 'asdf.jpg'
  const prefixUrl = createRepoUrlPrefixer(repo)
  expect(url).toBe(prefixUrl(url))
})

test('url prefixing and unprefixing', () => {
  const url = 'images/asdf.jpg'
  const prefixUrl = createRepoUrlPrefixer(repo)
  expect(url).toBe(unprefixUrl(prefixUrl(url)))
})

test('oneway', () => {
  const url = 'images/asdf.jpg?test=true'
  const prefixUrl = createRepoUrlPrefixer(repo, true)
  const newUrl = prefixUrl(url)
  expect(-1).toBe(newUrl.indexOf('#'))
  expect(newUrl).toBe(unprefixUrl(newUrl))
})

test('originalURL', () => {
  const url = 'http://host.ch/images/asdf.jpg#originalURL=test'
  expect(unprefixUrl(url)).toBe('test')
})
