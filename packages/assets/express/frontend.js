const fetch = require('isomorphic-unfetch')
const { returnImage } = require('../lib')
const {
  FRONTEND_BASE_URL,
  FRONTEND_BASIC_AUTH_USER,
  FRONTEND_BASIC_AUTH_PASS
} = process.env

if (!FRONTEND_BASE_URL) {
  console.warn('missing env FRONTEND_BASE_URL, the /frontend endpoint will not work')
}

module.exports = (server) => {
  server.get('/frontend/:path(*)', async (req, res) => {
    const {
      path
    } = req.params

    if (!FRONTEND_BASE_URL) {
      console.warn('FRONTEND_BASE_URL not set unable to handle request')
      return res.status(403).end()
    }

    // eslint-disable-next-line no-unused-vars
    const [_, sanitizedPath, webp] = new RegExp(/(.*?)(\.webp)?$/, 'g').exec(path)

    const frontendUrl = `${FRONTEND_BASE_URL}/${sanitizedPath}`
    const result = await fetch(frontendUrl, {
      method: 'GET',
      headers: {
        Authorization: FRONTEND_BASIC_AUTH_USER && FRONTEND_BASIC_AUTH_PASS
          ? `Basic ${Buffer.from(`${FRONTEND_BASIC_AUTH_USER}:${FRONTEND_BASIC_AUTH_PASS}`).toString('base64')}`
          : undefined
      }
    })
      .catch(error => {
        console.error('frontend fetch failed', { error })
        return res.status(404).end()
      })
    if (!result.ok) {
      console.error('frontend fetch failed', result.url, result.status)
      return res.status(result.status).end()
    }
    // add Link header, to be copied to final response
    result.headers.set('Link', `<${frontendUrl}>; rel="canonical"`)

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers,
      path,
      options: {
        ...req.query,
        webp: !!webp,
        cacheTags: ['frontend']
      }
    })
  })
}
