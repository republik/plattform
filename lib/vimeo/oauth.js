/**
POST /oauth2/authorize/client HTTP/1.1
Host:api.vimeo.com
Authorization: Basic eHZ6MWV2R ... o4OERSZHlPZw==
Content-Type: application/x-www-form-urlencoded;charset=UTF-8
Content-Length: 29
Accept-Encoding: gzip

grant_type=client_credentials
*/

const fetch = require('isomorphic-unfetch')

const {
  VIMEO_APP_KEY,
  VIMEO_APP_SECRET,
  VIMEO_APP_ACCESS_TOKEN
} = process.env

if (!VIMEO_APP_KEY) {
  console.warn("missing VIMEO_APP_KEY. Vimeo Embeds won't work.")
}
if (!VIMEO_APP_SECRET) {
  console.warn("missing VIMEO_APP_SECRET. Vimeo Embeds won't work.")
}
if (!VIMEO_APP_ACCESS_TOKEN) {
  console.warn(
    "missing VIMEO_APP_ACCESS_TOKEN. Owned vimeo video embeds won't work."
  )
}

module.exports = async () => {
  if (VIMEO_APP_ACCESS_TOKEN) {
    return VIMEO_APP_ACCESS_TOKEN
  }
  const credentials = Buffer.from(
    `${VIMEO_APP_KEY}:${VIMEO_APP_SECRET}`
  ).toString('base64')

  const response = await fetch(
    'https://api.vimeo.com/oauth/authorize/client',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Length': 29,
        'Accept-Encoding': 'gzip'
      },
      body: 'grant_type=client_credentials'
    }
  )
  .then(res => res.json())
  .catch(error => {
    console.error('Error getting bearer token:', error)
    return error
  })
  return response.access_token
}
