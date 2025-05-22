const nodePath = require('path')

const { returnImage, s3 } = require('@orbiting/backend-modules-assets/lib')
const { AWS_BUCKET_ALLOWLIST } = process.env

let buckets = {}
if (!AWS_BUCKET_ALLOWLIST) {
  console.warn(
    'missing env AWS_BUCKET_ALLOWLIST, the /:bucket/:path* endpoint will not work',
  )
} else {
  buckets = AWS_BUCKET_ALLOWLIST.split(',').reduce((agg, val) => {
    const [name, region] = val.split(':')
    agg[name] = region
    return agg
  }, {})
}

module.exports = (server) => {
  server.get('/s3/:bucket/:path(*)', async (req, res) => {
    const { bucket, path } = req.params

    if (!AWS_BUCKET_ALLOWLIST || !buckets[bucket]) {
      console.warn(`unauthorized s3 url requested: ${bucket}/${path}`)
      return res.status(403).end()
    }

    // eslint-disable-next-line no-unused-vars
    const [_, sanitizedPath, webp] = new RegExp(/(.*?)(\.webp)?$/, 'g').exec(
      path,
    )

    const region = buckets[bucket]
    const result = await s3.get({
      region,
      bucket,
      path: sanitizedPath,
    })
    if (!result.ok) {
      const { status, statusText, url } = result
      console.error('s3 fetch failed', { status, statusText, url })
      return res.status(result.status).end()
    }

    if (req.query?.download) {
      const filename = nodePath.basename(req.path)

      if (filename) {
        res.set('Content-Disposition', `attachment; filename="${filename}"`)
      }
    }

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers,
      path,
      options: {
        ...req.query,
        webp: !!webp,
        cacheTags: ['s3'],
      },
      req,
    })
  })
}
