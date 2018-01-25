const crypto = require('crypto')
const checkEnv = require('check-env')
const { upload: uploadS3 } = require('./s3')
const convertImage = require('./convertImage')
const querystring = require('querystring')

checkEnv[
  'ASSETS_SERVER_BASE_URL',
  'ASSETS_HMAC_KEY',
  'AWS_S3_BUCKET'
]

const {
  ASSETS_SERVER_BASE_URL,
  ASSETS_HMAC_KEY,
  AWS_S3_BUCKET
} = process.env

const PORTRAIT_FOLDER = 'portraits'


const uploadPortrait = async (portrait) => {

  const portraitPath = [
    `${PORTRAIT_FOLDER}/`,
    // always a new path—cache buster!
    crypto.createHash('md5').update(portrait).digest('hex'),
    '.jpeg'
  ].join('')

  const inputBuffer = Buffer.from(portrait, 'base64')

  const {meta, data} = await convertImage.toJPEG(inputBuffer)
  await uploadS3({
    stream: data,
    path: portraitPath,
    mimeType: 'image/jpeg',
    bucket: AWS_S3_BUCKET
  })
  const query = querystring.stringify({
    size: `${meta.width}x${meta.height}`
  })
  return `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}/${portraitPath}?${query}`
}

module.exports = {
  uploadPortrait
}
