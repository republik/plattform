const aws = require('aws-sdk')

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env

let s3
if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  aws.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  })
  s3 = new aws.S3({
    apiVersion: '2018-01-15'
  })
} else {
  console.warn('missing env AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY, uploading images will not work')
}

module.exports = async ({
  stream,
  path,
  mimeType,
  bucket
}) => {
  if (path[0] === '/') {
    throw new Error('path must not be absolute')
  }

  if (!s3) {
    throw new Error('s3 not available')
  }
  return s3.putObject({
    Body: stream,
    Key: path,
    Bucket: bucket,
    ACL: 'public-read'
  }).promise()
}
