const { Roles } = require('@orbiting/backend-modules-auth')
const sharp = require('sharp')
const {
  lib: { s3 },
} = require('@orbiting/backend-modules-assets')
const { getKey } = require('../../../lib/File/utils')

const { AWS_S3_BUCKET } = process.env

const extractImageMetadata = async (file) => {
  if (!file.contentType || !file.contentType.startsWith('image/')) {
    return {}
  }

  try {
    // Get the file from S3
    const key = getKey(file)
    const s3Object = await s3
      .getInstance()
      .getObject({
        Bucket: AWS_S3_BUCKET,
        Key: key,
      })
      .promise()

    // Extract image dimensions using sharp
    const metadata = await sharp(s3Object.Body).metadata()

    return {
      width: metadata.width,
      height: metadata.height,
    }
  } catch (error) {
    console.error('Failed to extract image metadata:', error)
    // Don't fail the upload if metadata extraction fails
    return {}
  }
}

module.exports = async (_, args, context) => {
  const { id } = args
  const { user: me, loaders, pgdb, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()

  try {
    const file = await loaders.File.byId.load(id)
    if (!file) {
      throw new Error(t('api/publikator/file/404'))
    }

    if (file.status !== 'Pending') {
      throw new Error(t('api/publikator/file/error/notPending'))
    }

    if (file.userId !== me.id) {
      throw new Error(t('api/publikator/file/error/notYours'))
    }

    // Extract image metadata if this is an image
    const imageMetadata = await extractImageMetadata(file)

    const updatedFile = await tx.publikator.files.updateAndGetOne(
      { id },
      {
        status: 'Private',
        updatedAt: new Date(),
        readyAt: new Date(),
        ...imageMetadata,
      },
    )

    await tx.transactionCommit()
    
    // Clear the loader cache for this file
    loaders.File.byId.clear(id)
    
    return updatedFile
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
