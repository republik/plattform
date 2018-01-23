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
  server.get('/:bucket/:path(*)', async (req, res) => {
    const {
      bucket,
      path
    } = req.params

    if (!AWS_BUCKET_WHITELIST || !buckets[bucket]) {
      console.warn(`unauthorized s3 url requested: ${bucket}/${path}`)
      return res.status(403).end()
    }

    const region = buckets[bucket]
    const result = await fetch(`https://s3.${region}.amazonaws.com/${bucket}/${path}`, {
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
