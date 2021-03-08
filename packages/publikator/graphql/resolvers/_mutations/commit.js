const debug = require('debug')('publikator:mutation:commit')
const sharp = require('sharp')
const visit = require('unist-util-visit')
const dataUriToBuffer = require('data-uri-to-buffer')
const Promise = require('bluebird')

const MDAST = require('@orbiting/remark-preset')
const {
  lib: {
    unprefixUrl,
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
      processImageUrlsInContent,
    },
  },
} = require('@orbiting/backend-modules-documents')

// const { ASSETS_SERVER_BASE_URL } = process.env

const generateImageData = async (blob) => {
  const meta = await sharp(blob).metadata()
  const suffix = meta.format
  const hash = hashObject(blob)
  const path = `images/${hash}.${suffix}`
  const imageUrl = `${path}?size=${meta.width}x${meta.height}`
  return {
    image: {
      path,
      hash,
      blob,
    },
    imageUrl,
  }
}

const extractImage = async (url, images) => {
  if (url) {
    try {
      const blob = dataUriToBuffer(url)
      const { image, imageUrl } = await generateImageData(blob)
      images.push(image)
      return imageUrl
    } catch (e) {
      debug('ignoring image node with url:' + url)
    }
  }
  return url
}

/* const isFromDifferentRepo = (url, repoId) =>
  url &&
  url.startsWith(`${ASSETS_SERVER_BASE_URL}/github/`) &&
  !url.includes(repoId) */

/* const importFromRepo = async (url, images, repoId) => {
  if (isFromDifferentRepo(url, repoId)) {
    try {
      const blob = await fetch(url).then((result) => result.buffer())
      const { image, imageUrl } = await generateImageData(blob)
      images.push(image)
      return imageUrl
    } catch (e) {
      console.warn('failed to transfer image', repoId, url, e)
    }
  }
  return url
} */

module.exports = async (_, args, context) => {
  const { user, t, pgdb, pubsub } = context
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

    // extract repo images
    const images = []
    const promises = []

    // @TODO: Import images from another repo (same owner)
    /* visit(mdast, 'image', async (node) => {
      promises.push(
        (async () => {
          node.url = await importFromRepo(node.url, images, repoId)
        })(),
      )
    })
    visit(mdast, 'zone', (node) => {
      if (node.data?.formatLogo) {
        promises.push(
          (async () => {
            node.data.formatLogo = await importFromRepo(
              node.data.formatLogo,
              images,
              repoId,
            )
          })(),
        )
      }
    })
    if (mdast.meta) {
      promises.push(
        ...Object.keys(mdast.meta).map(async (key) => {
          if (key.match(/image/i)) {
            mdast.meta[key] = await importFromRepo(
              mdast.meta[key],
              images,
              repoId,
            )
          }
        }),
      )

      const series = mdast.meta.series
      if (series && Array.isArray(series.episodes)) {
        if (series.logo) {
          promises.push(
            (async () => {
              series.logo = await importFromRepo(series.logo, images, repoId)
            })(),
          )
        }
        if (series.logoDark) {
          promises.push(
            (async () => {
              series.logoDark = await importFromRepo(
                series.logoDark,
                images,
                repoId,
              )
            })(),
          )
        }
        series.episodes.forEach((episode) => {
          if (episode.image) {
            promises.push(
              (async () => {
                episode.image = await importFromRepo(
                  episode.image,
                  images,
                  repoId,
                )
              })(),
            )
          }
        })
      }
    } */

    // reverse asset url prefixing
    // repo images
    processRepoImageUrlsInContent(mdast, unprefixUrl)
    processRepoImageUrlsInMeta(mdast, unprefixUrl)
    // embeds
    processImageUrlsInContent(mdast, unprefixUrl)

    visit(mdast, 'image', async (node) => {
      promises.push(
        (async () => {
          node.url = await extractImage(node.url, images)
        })(),
      )
    })
    visit(mdast, 'zone', (node) => {
      if (node.data?.formatLogo) {
        promises.push(
          (async () => {
            node.data.formatLogo = await extractImage(
              node.data.formatLogo,
              images,
            )
          })(),
        )
      }
    })

    if (mdast.meta) {
      promises.push(
        ...Object.keys(mdast.meta).map(async (key) => {
          if (key.match(/image/i)) {
            mdast.meta[key] = await extractImage(mdast.meta[key], images)
          }
        }),
      )

      const series = mdast.meta.series
      if (series && Array.isArray(series.episodes)) {
        if (series.logo) {
          promises.push(
            (async () => {
              series.logo = await extractImage(series.logo, images)
            })(),
          )
        }
        if (series.logoDark) {
          promises.push(
            (async () => {
              series.logoDark = await extractImage(series.logoDark, images)
            })(),
          )
        }
        series.episodes.forEach((episode) => {
          if (episode.image) {
            promises.push(
              (async () => {
                episode.image = await extractImage(episode.image, images)
              })(),
            )
          }
        })
      }
    }

    await Promise.all(promises)
    await Promise.map(images, (image) => maybeUploadImage(repoId, image))

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

    await pubsub.publish('repoUpdate', {
      repoUpdate: {
        id: repoId,
      },
    })

    return toCommit(commit)
  } catch (e) {
    await tx.transactionRollback()

    debug('rollback', { repoId, user: user.id })

    throw e
  }
}
