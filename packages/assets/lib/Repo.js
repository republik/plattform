const { upload, hasHead } = require('./s3')
const debug = require('debug')('assets:lib:Repo')

const {
  ASSETS_SERVER_BASE_URL,
  AWS_S3_BUCKET,
  AWS_S3_REPO_KEY_PREFIX = 'repos',
} = process.env

const BUCKET_URL = `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET}`

const getS3Url = (repoId, path) => {
  return `${BUCKET_URL}/${AWS_S3_REPO_KEY_PREFIX}/${repoId}/${path}`
}

const getS3Path = (repoId, path) => {
  return `${AWS_S3_REPO_KEY_PREFIX}/${repoId}/${path.split('?').shift()}`
}

const isImageUploaded = (repoId, image) => {
  const bucket = AWS_S3_BUCKET
  const path = getS3Path(repoId, image.path)

  return hasHead({ bucket, path })
}

const uploadImage = async (repoId, image) => {
  const bucket = AWS_S3_BUCKET
  const path = getS3Path(repoId, image.path)

  debug('uploading %s in bucket %s...', path, bucket)

  try {
    await upload({
      stream: image.blob,
      path,
      bucket: AWS_S3_BUCKET,
    })
  } catch (e) {
    console.error(e)
    throw new Error('upload image failed miserably')
  }

  debug('uploaded %s in bucket %s', path, bucket)

  return true
}

const maybeUploadImage = async (repoId, image) => {
  const bucket = AWS_S3_BUCKET
  const path = getS3Path(repoId, image.path)

  if (await isImageUploaded(repoId, image)) {
    debug('object %s exists already in bucket %s', path, bucket)
    return false
  }

  await uploadImage(repoId, image)

  return true
}

module.exports = {
  getS3Url,
  isImageUploaded,
  uploadImage,
  maybeUploadImage,
}
