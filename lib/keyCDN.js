const fetch = require('isomorphic-unfetch')

module.exports.purgeUrls = (paths) => {
  const {KEYCDN_API_KEY, KEYCDN_ZONE_ID, KEYCDN_ZONE_URL} = process.env

  return fetch(`https://api.keycdn.com/zones/purgeurl/${KEYCDN_ZONE_ID}.json`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + (Buffer.from(KEYCDN_API_KEY + ':').toString('base64'))
    },
    body: JSON.stringify({
      urls: paths.map(path => {
        return `${KEYCDN_ZONE_URL}${path}`
      })
    })
  })
}
