const crypto = require('crypto')
const checkEnv = require('check-env')
const uploadS3 = require('./uploadS3')
const convertImage = require('./convertImage')

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

  await convertImage.toJPEG(inputBuffer)
    .then((data) => {
      return uploadS3({
        stream: data,
        path: portraitPath,
        mimeType: 'image/jpeg',
        bucket: AWS_S3_BUCKET
      })
    })

  return `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}/${portraitPath}`
}

module.exports = {
  uploadPortrait
}
