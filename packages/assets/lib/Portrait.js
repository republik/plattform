const crypto = require('crypto')
const checkEnv = require('check-env')
const S3 = require('./s3')
const querystring = require('querystring')
const sharp = require('sharp')

checkEnv([
  'ASSETS_SERVER_BASE_URL'
])

const {
  ASSETS_SERVER_BASE_URL,
  AWS_S3_BUCKET // ./s3 warns if missing
} = process.env

const PORTRAIT_FOLDER = 'portraits'

const toJPEG = async (buffer) => {
  const image = sharp(buffer).rotate()
  const meta = await image.metadata()

  if (meta.format !== 'jpeg') {
    image.jpeg({ quality: 100 })
  }

  return {
    meta,
    data: await image.toBuffer()
  }
}

const upload = async (portrait, dry = false) => {
  const portraitPath = [
    `${PORTRAIT_FOLDER}/`,
    // always a new path—cache buster!
    crypto.createHash('md5').update(portrait).digest('hex'),
    '.jpeg'
  ].join('')

  const inputBuffer = Buffer.from(portrait, 'base64')

  const { meta, data } = await toJPEG(inputBuffer)

  if (!dry) {
    await S3.upload({
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

const del = (portraitUrl) => {
  if (!portraitUrl) {
    return
  }
  const [, bucket, path] = new RegExp(/.*?s3\/(.*?)\/(.*?)\?/).exec(portraitUrl)
  return S3.del({ bucket, path })
}

module.exports = {
  upload,
  del
}
