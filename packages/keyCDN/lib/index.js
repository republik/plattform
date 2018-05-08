const fetch = require('isomorphic-unfetch')
const debug = require('debug')('cdn')

const {
  KEYCDN_API_KEY,
  KEYCDN_ZONE_ID,
  KEYCDN_ZONE_URL
} = process.env

if (!KEYCDN_API_KEY || !KEYCDN_ZONE_ID || !KEYCDN_ZONE_URL) {
  console.warn('missing env KEYCDN_*, purgeUrls and purgeTags will not work')
}

const purge = (key, payload) => {
  if (!KEYCDN_API_KEY || !KEYCDN_ZONE_ID || !KEYCDN_ZONE_URL) {
    console.error('missing env KEYCDN_*, can\'t purge!')
    return
  }

  const url = `https://api.keycdn.com/zones/${key}/${KEYCDN_ZONE_ID}.json`
  debug('purge %s %O', url, payload)
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(KEYCDN_API_KEY + ':').toString('base64')}`
    },
    body: payload
  })
}

const purgeUrls = (paths) =>
  purge(
    'purgeurl',
    JSON.stringify({
      urls: paths.map(path => `${KEYCDN_ZONE_URL}${path}`)
    })
  )

const purgeTags = (tags) =>
  purge(
    'purgetag',
    JSON.stringify({
      tags
    })
  )

module.exports = {
  purgeUrls,
  purgeTags
}
