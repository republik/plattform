const visit = require('unist-util-visit')
const Promise = require('bluebird')
const crypto = require('crypto')

const {
  imageKeys: embedImageKeys,
  getEmbedByUrl,
  canGetEmbedType,
} = require('@orbiting/backend-modules-embeds')

const modifiers = require('./modifiers')
const { hasFullDocumentAccess } = require('./restrictions')

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

const processContentHashing = (content) => {
  content.children?.forEach((child) => {
    if (
      (child.identifier === 'TEASERGROUP' || child.identifier === 'TEASER') &&
      child.data &&
      !child.data.contentHash
    ) {
      child.data.contentHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(child))
        .digest('hex')
    }
  })
}

const processRepoImageUrlsInContent = async (content, fn) => {
  const fns = []

  // mdast content
  visit(content, 'image', (node) => {
    fns.push(async () => {
      node.url = await fn(node.url)
    })
  })
  visit(content, 'zone', (node) => {
    if (node.data?.formatLogo) {
      fns.push(async () => {
        node.data.formatLogo = await fn(node.data.formatLogo)
      })
    }
  })

  return Promise.each(fns, (fn) => fn())
}

const processEmbedImageUrlsInContent = async (mdast, fn) => {
  const fns = []

  visit(mdast, 'zone', (node) => {
    if (node.data && node.identifier.startsWith('EMBED')) {
      fns.push(() => {
        return Promise.map(embedImageKeys, async (key) => {
          if (node.data[key]) {
            node.data[key] = await fn(node.data[key])
          }
          if (node.data.src?.[key]) {
            node.data.src[key] = await fn(node.data.src[key])
          }
        })
      })
    }
  })

  return Promise.each(fns, (fn) => fn())
}

const processEmbedsInContent = async (mdast, fn, context) => {
  const fns = []

  visit(mdast, 'zone', (node) => {
    if (node.data && node.identifier.startsWith('EMBED')) {
      visit(node, 'link', (link) => {
        const { url } = link

        fns.push(async () => {
          try {
            const embed =
              url &&
              canGetEmbedType(node.data.__typename) &&
              (await getEmbedByUrl(url, context))

            if (embed) {
              Object.keys(node.data)
                .filter((key) => typeof node.data[key] !== 'object')
                .filter((key) => !!embed[key])
                .forEach((key) => (node.data[key] = embed[key]))
              if (node.data.src) {
                Object.keys(node.data.src)
                  .filter((key) => !!embed.src?.[key])
                  .forEach((key) => (node.data.src[key] = embed.src[key]))
              }
            }
          } catch (e) {
            console.warn(
              `processEmbedsInContent on "${url}" failed: ${e.message}`,
            )
          }

          await Promise.map(embedImageKeys, async (key) => {
            if (node.data[key]) {
              node.data[key] = await fn(node.data[key])
            }
            if (node.data.src?.[key]) {
              node.data.src[key] = await fn(node.data.src[key])
            }
          })

          return node.data
        })
      })
    }
  })

  return Promise.all(fns.map((fn) => fn()))
}

const processMembersOnlyZonesInContent = (mdast, user, apiKey) => {
  visit(mdast, 'zone', (node) => {
    if (node.data?.membersOnly && !hasFullDocumentAccess(user, apiKey)) {
      node.children = []
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

const processIfHasAccess = (mdast, user, apiKey) => {
  visit(mdast, 'zone', (node, index, parent) => {
    if (node.identifier === 'IF' && node.data?.present === 'hasAccess') {
      const elseIndex = node.children.findIndex(
        ({ identifier }) => identifier === 'ELSE',
      )

      const children = hasFullDocumentAccess(user, apiKey)
        ? node.children.filter((_, index) => index !== elseIndex)
        : node.children.find((_, index) => index === elseIndex)?.children || []

      // unwrap into parent children
      parent.children = [
        ...parent.children.slice(0, index),
        ...children,
        ...parent.children.slice(index + 1),
      ]

      // revisit entry index again as children may contain an IF block
      return index
    }
  })
}

module.exports = {
  processContentHashing,
  processRepoImageUrlsInContent,
  processEmbedImageUrlsInContent,
  processRepoImageUrlsInMeta,
  processEmbedsInContent,
  processMembersOnlyZonesInContent,
  processNodeModifiersInContent,
  processIfHasAccess,
}
