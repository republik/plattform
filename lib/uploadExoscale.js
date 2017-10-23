const fetch = require('isomorphic-unfetch')
const AwsSign = require('aws-sign')

const HOST = 'sos.exo.io'
const KEY = process.env.EXO_KEY
const SECRET = process.env.EXO_SECRET

module.exports = ({
  stream,
  path,
  mimeType,
  bucket
}) => {
  if (path[0] !== '/') {
    throw new Error('path must be absolute')
  }

  const signer = new AwsSign({
    accessKeyId: KEY,
    secretAccessKey: SECRET
  })

  let options = {
    method: 'PUT',
    host: bucket, // bug in AwsSign https://github.com/egorFiNE/node-aws-sign/blob/master/index.js#L72
    path: path,
    headers: {
      'Content-Type': mimeType,
      'x-amz-acl': 'public-read'
    }
  }
  signer.sign(options)

  return fetch(`https://${bucket}.${HOST}${path}`, {
    method: 'PUT',
    headers: options.headers,
    body: stream
  })
}
