const { returnImage } = require('../lib')
const { PDF_BASE_URL, FRONTEND_BASE_URL } = process.env

if (!PDF_BASE_URL) {
  console.warn('missing env PDF_BASE_URL, the /pdf endpoint will not work')
}

module.exports = (server) => {
  server.get('/pdf/:path(*)', async (req, res) => {
    if (!PDF_BASE_URL) {
      console.warn('PDF_BASE_URL not set unable to handle request')
      return res.status(403).end()
    }

    // get express path
    const { path } = req.params

    // pick query parameters intended for PDF endpoint
    // (pass along rest as options, later)
    const { images, download, format, ...options } = req.query

    // build URL to fetch PDF from
    // TODO: PDF_BASE_URL = https://screenshot.republik.ch/api/pdf
    const fetchUrl = new URL(`${PDF_BASE_URL}/${path}`)

    // add params
    fetchUrl.searchParams.set('url', `${FRONTEND_BASE_URL}/${path}`)
    images && fetchUrl.searchParams.set('images', images)
    download && fetchUrl.searchParams.set('download', download)
    format && fetchUrl.searchParams.set('format', format)

    const result = await fetch(fetchUrl, { method: 'GET' }).catch((error) => {
      console.error('pdf fetch failed', fetchUrl.toString(), { error })
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
        ...options,
        cacheTags: ['pdf-proxy'],
      },
      req,
    })
  })
}
