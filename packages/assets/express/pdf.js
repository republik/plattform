const fetch = require('isomorphic-unfetch')
const { returnImage } = require('../lib')
const {
  PDF_BASE_URL
} = process.env

if (!PDF_BASE_URL) {
  console.warn('missing env PDF_BASE_URL, the /pdf endpoint will not work')
}

module.exports = (server) => {
  server.get('/pdf/:path(*)', async (req, res) => {
    if (!PDF_BASE_URL) {
      console.warn('PDF_BASE_URL not set unable to handle request')
      return res.status(403).end()
    }

    // path with query
    const path = req.originalUrl.replace(/^\/pdf/, '')

    const result = await fetch(`${PDF_BASE_URL}${path}`, {
      method: 'GET'
    })
      .catch(error => {
        console.error('pdf fetch failed', { error })
        return res.status(404).end()
      })
    if (!result.ok) {
      console.error('pdf fetch failed', result.url, result.status)
      return res.status(result.status).end()
    }

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers,
      path,
      options: {
        ...req.query,
        cacheTags: ['pdf-proxy']
      }
    })
  })
}
