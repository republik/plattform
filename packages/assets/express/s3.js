const fetch = require('isomorphic-unfetch')
const debug = require('debug')('assets:s3')
const { returnImage } = require('../lib')
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

    const [_, sanitizedPath, webp] = new RegExp(/(.*?)(\.webp)?$/, 'g').exec(path)

    const region = buckets[bucket]
    const result = await fetch(`https://s3.${region}.amazonaws.com/${bucket}/${sanitizedPath}`, {
      method: 'GET'
    })
      .catch(error => {
        console.error('s3 fetch failed', { error })
        return res.status(404).end()
      })
    if (!result.ok) {
      console.error('s3 fetch failed', result.url, result.status)
      return res.status(result.status).end()
    }

    return returnImage({
      response: res,
      stream: result.body,
      headers: result.headers.raw(),
      options: {
        ...req.query,
        webp: !!webp
      }
    })
  })
}
