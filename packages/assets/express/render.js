const renderUrl = require('../lib/renderUrl')
const { returnImage } = require('../lib')

const {
  RENDER_URL_WHITELIST
} = process.env

if (!RENDER_URL_WHITELIST) {
  console.warn('missing env RENDER_URL_WHITELIST, the /render endpoint will not work')
}
const whitelistedUrls = RENDER_URL_WHITELIST && RENDER_URL_WHITELIST.split(',')

module.exports = (server) => {
  server.get('/render', async function (req, res) {
    const { url, width, height, resize } = req.query
    const allowed = whitelistedUrls && !!whitelistedUrls.find(whiteUrl => url.indexOf(whiteUrl) === 0)
    if (!allowed) {
      return res.status(403).end()
    }
    const stream = await renderUrl(url, width || 1200, height || 628)
    return returnImage(res, stream, resize)
  })
}
