const fetch = require('isomorphic-unfetch')
const debug = require('debug')('assets:proxy')
const {
  authenticate,
  returnImage
} = require('../lib')

module.exports = (server) => {
  server.get('/proxy', async (req, res) => {
    const {
      originalURL: url,
      mac,
      resize
    } = req.query
    debug('external fetch %s', url)

    if (!url) {
      return res.status(404).end()
    }

    if (!mac || mac !== authenticate(url)) {
      console.warn('unauthorized asset url requested: ' + url)
      return res.status(403).end()
    }

    const result = await fetch(url, {
      method: 'GET'
    })
      .catch(error => {
        console.error('gettting image failed', { error })
        return res.status(404).end()
      })

    return returnImage(res, result.body, resize)
  })
}
