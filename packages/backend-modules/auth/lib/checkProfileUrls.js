const { isURL } = require('validator')

function validate(url) {
  return isURL(url, {
    require_host: true,
    require_tld: true,
    require_protocol: true,
    protocols: ['https', 'http'],
  })
}

module.exports = function checkProfileUrls(urls) {
  let results = []

  if (Array.isArray(urls)) {
    results = urls.map(validate)
  }

  if (typeof urls === 'string') {
    results = [validate(urls)]
  }

  return results.every(Boolean)
}
