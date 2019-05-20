const fetch = require('isomorphic-unfetch')
const debug = require('debug')('assets:proxy')
const {
  authenticate,
  returnImage
} = require('../lib')

module.exports = (server) => {
  server.get('/proxy(.:webp)?', async (req, res) => {
    const {
      originalURL: url,
      mac
    } = req.query

    if (!url) {
      return res.status(404).end()
    }

    if (!mac || mac !== authenticate(url)) {
      console.warn('proxy unauthorized url requested:', url)
      return res.status(403).end()
    }

    debug('GET %s', url)
    const result = await fetch(url, {
      method: 'GET'
    })
      .catch(error => {
        console.error('proxy fetch failed', { error })
        return res.status(404).end()
      })
    if (!result.ok) {
      console.error('proxy fetch failed', result.url, result.status)
      return res.status(result.status).end()
    }

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers,
      path: url,
      options: {
        ...req.query,
        webp: !!req.params.webp,
        cacheTags: ['proxy']
      }
    })
  })
}
