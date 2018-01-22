const router = require('express').Router()
const renderUrl = require('../lib/renderUrl')

const {
  RENDER_URL_WHITELIST
} = process.env

if (!RENDER_URL_WHITELIST) {
  console.warn('missing env RENDER_URL_WHITELIST, the /render endpoint will not work')
}

module.exports = (server) => {
  const whitelistedUrls = RENDER_URL_WHITELIST && RENDER_URL_WHITELIST.split(',')
  return server.use(
    router.get('/render', async function (req, res) {
      const { url, width, height } = req.query
      const allowed = whitelistedUrls && !!whitelistedUrls.find(whiteUrl => url.indexOf(whiteUrl) === 0)
      if (!allowed) {
        return res.status(403).end()
      }
      return res.end(
        // await renderUrl(`${FRONTEND_BASE_URL}/community?share=${testimonial.id}`, 1200, 628)
        await renderUrl(url, width || 1200, height || 628)
      )
    })
  )
}
