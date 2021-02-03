const visit = require('unist-util-visit')
const {
  Roles: { userIsInRoles },
} = require('@orbiting/backend-modules-auth')

const modifiers = require('./modifiers')

const { DOCUMENTS_RESTRICT_TO_ROLES } = process.env

const processRepoImageUrlsInContent = (mdast, fn) => {
  visit(mdast, 'image', (node) => {
    node.url = fn(node.url)
  })
  visit(mdast, 'zone', (node) => {
    if (node.data?.formatLogo) {
      node.data.formatLogo = fn(node.data.formatLogo)
    }
  })
}

const processRepoImageUrlsInMeta = (mdast, fn) => {
  if (mdast.meta) {
    Object.keys(mdast.meta).forEach((key) => {
      if (key.match(/image/i)) {
        mdast.meta[key] = fn(mdast.meta[key])
      }
    })
    const series = mdast.meta.series
    if (series && Array.isArray(series.episodes)) {
      if (series.logo) {
        series.logo = fn(series.logo)
      }
      series.episodes.forEach((episode) => {
        if (episode.image) {
          episode.image = fn(episode.image)
        }
      })
    }
  }
}

const {
  imageKeys: embedImageKeys,
} = require('@orbiting/backend-modules-embeds')

const processImageUrlsInContent = (mdast, fn) => {
  visit(mdast, 'zone', (node) => {
    if (node.data && node.identifier.indexOf('EMBED') > -1) {
      for (const key of embedImageKeys) {
        if (node.data[key]) {
          node.data[key] = fn(node.data[key])
        }
      }
      if (typeof node.data.src === 'object') {
        for (const key of embedImageKeys) {
          if (node.data.src && node.data.src[key]) {
            node.data.src[key] = fn(node.data.src[key])
          }
        }
      }
    }
  })
}

const processEmbedsInContent = (mdast, fn) => {
  visit(mdast, 'zone', (node) => {
    if (node.data && node.identifier.indexOf('EMBED') > -1) {
      const result = fn(node.data)
      if (result !== undefined) {
        node.data = result
      }
    }
  })
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
  processImageUrlsInContent,
  processEmbedsInContent,
  processNodeModifiersInContent,
}
