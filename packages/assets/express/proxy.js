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
    } = req.query

    if (!url) {
      return res.status(404).end()
    }

    //if (!mac || mac !== authenticate(url)) {
    //  console.warn('unauthorized asset url requested: ' + url)
    //  return res.status(403).end()
    //}

    debug('GET %s', url)
    const result = await fetch(url, {
      method: 'GET'
    })
      .catch(error => {
        console.error('gettting image failed', { error })
        return res.status(404).end()
      })

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers.raw(),
      options: req.query
    })
  })
}
