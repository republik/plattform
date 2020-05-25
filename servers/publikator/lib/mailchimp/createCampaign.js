const fetch = require('isomorphic-unfetch')

const { MAILCHIMP_URL, MAILCHIMP_API_KEY } = process.env

module.exports = async () => {
  return fetch(`${MAILCHIMP_URL}/3.0/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')}`
    },
    body: JSON.stringify({
      type: 'regular',
      settings: {
        content_type: 'html'
      },
      tracking: {
        opens: false,
        html_clicks: false,
        text_clicks: false
      }
    })
  })
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
}
