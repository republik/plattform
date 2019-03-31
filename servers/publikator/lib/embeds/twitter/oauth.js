/**
POST /oauth2/token HTTP/1.1
Host: api.twitter.com
User-Agent: My Twitter App v1.0.23
Authorization: Basic eHZ6MWV2R ... o4OERSZHlPZw==
Content-Type: application/x-www-form-urlencoded;charset=UTF-8
Content-Length: 29
Accept-Encoding: gzip

grant_type=client_credentials
*/

const fetch = require('isomorphic-unfetch')

const {
  TWITTER_APP_KEY,
  TWITTER_APP_SECRET
} = process.env

if (!TWITTER_APP_KEY) { console.warn('missing TWITTER_APP_KEY. Twitter Embeds won\'t work.') }
if (!TWITTER_APP_SECRET) { console.warn('missing TWITTER_APP_SECRET. Twitter Embeds won\'t work.') }

module.exports = async () => {
  if (!TWITTER_APP_KEY || !TWITTER_APP_SECRET) {
    throw new Error('missing TWITTER_APP_KEY or TWITTER_APP_SECRET')
  }

  const credentials = Buffer
    .from(`${TWITTER_APP_KEY}:${TWITTER_APP_SECRET}`)
    .toString('base64')

  const response = await fetch(
    'https://api.twitter.com/oauth2/token',
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
