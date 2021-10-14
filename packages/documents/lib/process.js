const visit = require('unist-util-visit')

const {
  Roles: { userIsInRoles },
} = require('@orbiting/backend-modules-auth')
const {
  imageKeys: embedImageKeys,
  getEmbedByUrl,
  canGetEmbedType,
} = require('@orbiting/backend-modules-embeds')
const { mdastToString } = require('@orbiting/backend-modules-utils')

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
    if (node.data && node.identifier.indexOf('EMBED') > -1) {
      for (const key of embedImageKeys) {
        if (node.data[key]) {
          fns.push(async () => {
            node.data[key] = await fn(node.data[key])
          })
        }
      }
      if (typeof node.data.src === 'object') {
        for (const key of embedImageKeys) {
          if (node.data.src && node.data.src[key]) {
            fns.push(async () => {
              node.data.src[key] = await fn(node.data.src[key])
            })
          }
        }
      }
    }
  })

  return Promise.all(fns.map((fn) => fn()))
}

const processEmbedsInContent = async (mdast, context) => {
  const fns = []

  visit(mdast, 'zone', (node) => {
    if (
      node.data &&
      node.identifier.indexOf('EMBED') > -1 &&
      canGetEmbedType(node.data?.__typename)
    ) {
      fns.push(async () => {
        const url = mdastToString(node)
        if (url) {
          try {
            const embed = await getEmbedByUrl(url, context)
            if (embed) {
              node.data = {
                ...node.data,
                ...embed,
              }
            }
          } catch (e) {
            console.warn(`processEmbedsInContent on "${url}" failed: ${e.message}`)
          }
        }

        return node.data
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
