const getUrls = require('get-urls')

const getUrlsFromText = (text) => {
  const urls = [
    ...getUrls(
      text,
      {
        stripWWW: false,
        sortQueryParameters: false
      }
    )
  ]
  return urls
}

module.exports = {
  getUrlsFromText
}
