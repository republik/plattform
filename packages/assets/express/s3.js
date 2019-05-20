const { returnImage, s3 } = require('../lib')
const {
  AWS_BUCKET_WHITELIST
} = process.env

let buckets = {}
if (!AWS_BUCKET_WHITELIST) {
  console.warn('missing env AWS_BUCKET_WHITELIST, the /:bucket/:path* endpoint will not work')
} else {
  buckets = AWS_BUCKET_WHITELIST
    .split(',')
    .reduce(
      (agg, val) => {
        const [name, region] = val.split(':')
        agg[name] = region
        return agg
      }, {}
    )
}

module.exports = (server) => {
  server.get('/s3/:bucket/:path(*)', async (req, res) => {
    const {
      bucket,
      path
    } = req.params

    if (!AWS_BUCKET_WHITELIST || !buckets[bucket]) {
      console.warn(`unauthorized s3 url requested: ${bucket}/${path}`)
      return res.status(403).end()
    }

    // eslint-disable-next-line no-unused-vars
    const [_, sanitizedPath, webp] = new RegExp(/(.*?)(\.webp)?$/, 'g').exec(path)

    const region = buckets[bucket]
    const result = await s3.get({
      region,
      bucket,
      path: sanitizedPath
    })
    if (!result.ok) {
      console.error('s3 fetch failed', result)
      return res.status(result.status).end()
    }

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers,
      path,
      options: {
        ...req.query,
        webp: !!webp,
        cacheTags: ['s3']
      }
    })
  })
}
