const getUrls = require('get-urls')

const getUrlsFromText = (text) => {
  return Array.from(
    getUrls(
      text,
      {
        stripWWW: false,
        sortQueryParameters: false
      }
    )
  )
}

module.exports = {
  getUrlsFromText
}
