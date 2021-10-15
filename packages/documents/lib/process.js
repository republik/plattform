const visit = require('unist-util-visit')
const Promise = require('bluebird')

const {
  Roles: { userIsInRoles },
} = require('@orbiting/backend-modules-auth')
const {
  imageKeys: embedImageKeys,
  getEmbedByUrl,
  canGetEmbedType,
} = require('@orbiting/backend-modules-embeds')

const modifiers = require('./modifiers')

const { DOCUMENTS_RESTRICT_TO_ROLES } = process.env

const processRepoImageUrlsInContent = async (mdast, fn) => {
  const fns = []

  visit(mdast, 'image', (node) => {
    fns.push(async () => {
      node.url = await fn(node.url)
    })
  })
  visit(mdast, 'zone', (node) => {
    if (node.data?.formatLogo) {
      fns.push(async () => {
        node.data.formatLogo = await fn(node.data.formatLogo)
      })
    }
  })

  return Promise.all(fns.map((fn) => fn()))
}

const processRepoImageUrlsInMeta = async (mdast, fn) => {
  const fns = []

  if (mdast.meta) {
    Object.keys(mdast.meta).forEach((key) => {
      if (key.match(/image/i)) {
        fns.push(async () => {
          mdast.meta[key] = await fn(mdast.meta[key])
        })
      }
    })
    const series = mdast.meta.series
    if (series && Array.isArray(series.episodes)) {
      if (series.logo) {
        fns.push(async () => {
          series.logo = await fn(series.logo)
        })
      }
      if (series.logoDark) {
        fns.push(async () => {
          series.logoDark = await fn(series.logoDark)
        })
      }
      series.episodes.forEach((episode) => {
        if (episode.image) {
          fns.push(async () => {
            episode.image = await fn(episode.image)
          })
        }
      })
    }
  }

  return Promise.all(fns.map((fn) => fn()))
}

const processEmbedImageUrlsInContent = async (mdast, fn) => {
  const fns = []

  visit(mdast, 'zone', (node) => {
    if (node.data && node.identifier.startsWith('EMBED')) {
      fns.push(() =>
        Promise.map(embedImageKeys, async (key) => {
          node.data?.[key] && (node.data[key] = await fn(node.data[key]))
          node.data?.src?.[key] &&
            (node.data.src[key] = await fn(node.data.src[key]))
        }),
      )
    }
  })

  return Promise.all(fns.map((fn) => fn()))
}

const processEmbedsInContent = async (mdast, fn, options) => {
  const { context, existingPropsOnly = false } = options
  const fns = []

  visit(mdast, 'zone', (node) => {
    if (node.data && node.identifier.startsWith('EMBED')) {
      visit(node, 'link', (link) => {
        const { url } = link

        fns.push(async () => {
          try {
            const embed =
              url &&
              canGetEmbedType(node.data?.__typename) &&
              (await getEmbedByUrl(url, context))

            if (embed) {
              if (existingPropsOnly) {
                Object.keys(node.data)
                  .filter((key) => typeof node.data[key] !== 'object')
                  .filter((key) => embed[key])
                  .forEach((key) => (node.data[key] = embed[key]))
                Object.keys(node.data.src)
                  .filter((key) => typeof node.data.src[key] !== 'object')
                  .filter((key) => embed.src?.[key])
                  .forEach((key) => (node.data.src[key] = embed.src[key]))
              } else {
                Object.assign(node.data, embed)
              }
            }
          } catch (e) {
            console.warn(
              `processEmbedsInContent on "${url}" failed: ${e.message}`,
            )
          }

          await Promise.map(embedImageKeys, async (key) => {
            node.data?.[key] && (node.data[key] = await fn(node.data[key]))
            node.data?.src?.[key] &&
              (node.data.src[key] = await fn(node.data.src[key]))
          })

          return node.data
        })
      })
    }
  })

  return Promise.all(fns.map((fn) => fn()))
}

const processMembersOnlyZonesInContent = (mdast, user) => {
  if (!DOCUMENTS_RESTRICT_TO_ROLES) {
    return
  }
  visit(mdast, 'zone', (node) => {
    if (node.data && node.data.membersOnly) {
      const roles = DOCUMENTS_RESTRICT_TO_ROLES.split(',')

      if (!userIsInRoles(user, roles)) {
        node.children = []
      }
    }
  })
}

const processNodeModifiersInContent = (mdast, user) => {
  visit(mdast, 'zone', (node) => {
    node.data?.modifiers?.forEach?.(({ name, ...settings }) =>
      modifiers[name]?.(settings, node, user),
    )

    // Prevent modifiers prop to be exposed
    delete node.data?.modifiers
  })
}

module.exports = {
  processMembersOnlyZonesInContent,
  processRepoImageUrlsInContent,
  processRepoImageUrlsInMeta,
  processEmbedImageUrlsInContent,
  processEmbedsInContent,
  processNodeModifiersInContent,
}
