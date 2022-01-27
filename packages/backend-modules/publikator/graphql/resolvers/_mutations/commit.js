const debug = require('debug')('publikator:mutation:commit')
const sharp = require('sharp')
const dataUriToBuffer = require('data-uri-to-buffer')
const Promise = require('bluebird')
const fetch = require('isomorphic-unfetch')

const MDAST = require('@orbiting/remark-preset')
const {
  lib: {
    isDataUrl,
    isHttpUrl,
    hasOriginalKeyHash,
    createRepoUrlUnprefixer,
    Repo: { maybeUploadImage },
  },
} = require('@orbiting/backend-modules-assets')
const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const { hashObject } = require('../../../lib/git')
const { updateCurrentPhase, toCommit } = require('../../../lib/postgres')

const {
  lib: {
    process: {
      processRepoImageUrlsInContent,
      processRepoImageUrlsInMeta,
      processEmbedImageUrlsInContent,
    },
    resolve: { getRepoId },
  },
} = require('@orbiting/backend-modules-documents')

const generateImageData = async (blob) => {
  const meta = await sharp(blob).metadata()
  const suffix = meta.format
  const hash = hashObject(blob)
  const path = `images/${hash}.${suffix}`
  return {
    blob,
    hash,
    path,
    meta,
  }
}

const maybeFetchToBlob = async (url) => {
  if (!isHttpUrl(url) || !hasOriginalKeyHash(url)) {
    return false
  }

  return fetch(url)
    .then((r) => r.buffer())
    .then(generateImageData)
}

const maybeDataUriToBlob = async (url) => {
  if (!isDataUrl(url)) {
    return false
  }

  return generateImageData(dataUriToBuffer(url))
}

const createImageUrlHandler = (repoId) => {
  const unprefix = createRepoUrlUnprefixer(repoId)

  return async (url) => {
    const unprefixedUrl = unprefix(url)

    const image =
      (await maybeFetchToBlob(unprefixedUrl)) ||
      (await maybeDataUriToBlob(unprefixedUrl))

    if (!image) {
      return unprefixedUrl
    }

    await maybeUploadImage(repoId, image)

    return `${image.path}?size=${image.meta.width}x${image.meta.height}`
  }
}

module.exports = async (_, args, context) => {
  const { user, t, pgdb, pubsub, loaders } = context
  ensureUserHasRole(user, 'editor')

  const { repoId, parentId, message, document, isTemplate } = args

  const { content: mdast } = document
  const { meta } = mdast

  debug({ repoId, message })

  const tx = await pgdb.transactionBegin()

  try {
    if (isTemplate && !meta.title) {
      throw new Error(t('api/commit/templateTitle/required'))
    }

    if (isTemplate && !meta.slug) {
      throw new Error(t('api/commit/templateSlug/required'))
    }

    /**
     * Each document in a series should point to a series master.
     * 
     * In a master document, meta.series.overview should contain a repo URL (and
     * is usually a self-reference).
     * 
     * In an episode document, meta.series should contain a repo URL.
     * 
     * meta.series is either an object (when master) or a string (when episode).
     */
    const { repoId: seriesMasterRepoId } = getRepoId(
      meta.series?.overview ||
      (typeof meta.series === 'string' && meta.series),
    )

    if (seriesMasterRepoId) {
      const seriesMasterRepo = await loaders.Commit.byRepoIdLatest.load(
        seriesMasterRepoId
      )

      if (seriesMasterRepo && typeof seriesMasterRepo.meta.series !== 'object') {
        throw new Error(t('api/commit/seriesMaster/required'))
      }
    }

    const repo = await tx.publikator.repos.findOne({ id: repoId })
    if (repo) {
      if (!parentId) {
        throw new Error(t('api/commit/parentId/required', { repoId }))
      }
    } else {
      if (parentId) {
        throw new Error(t('api/commit/parentId/notAllowed', { repoId }))
      }

      await tx.publikator.repos.insert({ id: repoId, meta: { isTemplate } })
    }

    const imageUrlHandler = createImageUrlHandler(repoId)

    await Promise.all([
      processRepoImageUrlsInContent(mdast, imageUrlHandler),
      processRepoImageUrlsInMeta(mdast, imageUrlHandler),
      processEmbedImageUrlsInContent(mdast, imageUrlHandler),
    ])

    mdast.meta = {}

    const markdown = MDAST.stringify(mdast)
    const parentCommit =
      parentId && (await tx.publikator.commits.findOne({ id: parentId }))

    const author = {
      name: user.name,
      email: user.email,
    }

    const commit = await tx.publikator.commits.insertAndGet({
      repoId,
      content: markdown,
      meta,
      message,
      userId: user.id,
      author,
      ...(parentCommit && { parentIds: [parentCommit.id] }),
    })

    await updateCurrentPhase(repoId, tx)

    await tx.transactionCommit()

    // @TODO: Safe to remove, once repoChange is adopted
    await pubsub.publish('repoUpdate', {
      repoUpdate: {
        id: repoId,
      },
    })

    await pubsub.publish('repoChange', {
      repoChange: {
        repoId,
        mutation: 'CREATED',
        commit,
      },
    })

    return toCommit(commit)
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }
}
