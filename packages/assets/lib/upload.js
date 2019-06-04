const crypto = require('crypto')
const checkEnv = require('check-env')
const { upload: uploadS3 } = require('./s3')
const querystring = require('querystring')
const sharp = require('sharp')

checkEnv([
  'ASSETS_SERVER_BASE_URL',
  'AWS_S3_BUCKET'
])

const {
  ASSETS_SERVER_BASE_URL,
  AWS_S3_BUCKET
} = process.env

const PORTRAIT_FOLDER = 'portraits'

const toJPEG = async (buffer) => {
  const image = sharp(buffer)
    .rotate()
    .jpeg({
      quality: 100
    })
  return {
    meta: await image.metadata(),
    data: await image.toBuffer()
  }
}

const getMeta = async (buffer) => {
  const image = sharp(buffer)
  return image.metadata()
}

const uploadPortrait = async (portrait, isJPEG = false, dry = false) => {
  const portraitPath = [
    `${PORTRAIT_FOLDER}/`,
    // always a new path—cache buster!
    crypto.createHash('md5').update(portrait).digest('hex'),
    '.jpeg'
  ].join('')

  const inputBuffer = Buffer.from(portrait, 'base64')

  const { meta, data } = isJPEG
    ? { meta: await getMeta(inputBuffer), data: inputBuffer }
    : await toJPEG(inputBuffer)

  if (!dry) {
    await uploadS3({
      stream: data,
      path: portraitPath,
      mimeType: 'image/jpeg',
      bucket: AWS_S3_BUCKET
    })
  }

  const query = querystring.stringify({
    size: `${meta.width}x${meta.height}`
  })
  return `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}/${portraitPath}?${query}`
}

module.exports = {
  uploadPortrait
}
