const { URL } = require('url')

const addFormatAuto = (urlString) => {
  if (!urlString?.trim()) {
    return urlString
  }
  const url = new URL(urlString)
  if (!url.searchParams.has('format')) {
    url.searchParams.set('format', 'auto')
    return url.toString()
  }
  return urlString
}

module.exports = {
  addFormatAuto,
}
