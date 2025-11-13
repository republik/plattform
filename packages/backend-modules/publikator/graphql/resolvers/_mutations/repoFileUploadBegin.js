const { Roles } = require('@orbiting/backend-modules-auth')

const { getSafeFileName } = require('../../../lib/File/utils')

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB in bytes

module.exports = async (_, args, context) => {
  const { repoId, name, contentType, size } = args
  const { user: me, loaders, pgdb, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  // Validate image uploads
  if (contentType && contentType.startsWith('image/')) {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      throw new Error(
        t(
          'api/publikator/file/unsupportedImageType',
          {
            type: contentType,
          },
          `Unsupported image type: ${contentType}. Allowed types: jpeg, png, gif, svg`,
        ),
      )
    }

    if (size && size > MAX_FILE_SIZE) {
      throw new Error(
        t(
          'api/publikator/file/tooLarge',
          {
            maxSizeMB: MAX_FILE_SIZE / 1024 / 1024,
          },
          `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        ),
      )
    }
  }

  const tx = await pgdb.transactionBegin()

  try {
    // Check if repo exists, if not create it (similar to commit mutation)
    let repo = await tx.publikator.repos.findOne({ id: repoId })
    if (!repo) {
      // Create the repo if it doesn't exist yet (first upload before first commit)
      repo = await tx.publikator.repos.insertAndGet({ 
        id: repoId, 
        meta: {} 
      })
    }

    const safeFileName = getSafeFileName(name)

    const file = await tx.publikator.files.insertAndGet({
      repoId: repo.id,
      name: safeFileName,
      status: 'Pending',
      userId: me.id,
      author: {
        name: me.name,
        email: me.email,
      },
      contentType,
      size,
    })

    await tx.transactionCommit()
    return file
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
