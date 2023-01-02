const Promise = require('bluebird')
const {
  getContributorUserIds,
  getContributorUserLinks,
  getAudioCover,
} = require('../../lib/meta')
const { stringifyNode } = require('../../lib/resolve')
const {
  Analyzer,
} = require('@orbiting/backend-modules-statistics/lib/credits/analyzer')

module.exports = {
  // deprecated, left in for smooth transition including deploys
  authors: async (meta, _, context) => {
    const { loaders } = context
    if (!meta?.credits?.children) {
      return []
    }

    const ids = await getContributorUserIds(meta?.credits?.type, meta, context)

    return Promise.map(ids, (id) => loaders.User.byId.load(id)).filter(Boolean)
  },
  credits: (meta) => {
    return Array.isArray(meta.credits) // old data, e.g. pre-reindex
      ? meta.credits
      : meta.credits?.children
  },
  contributors: async (meta, _, context) => {
    const metaContributors = await Promise.map(
      meta.contributors || [],
      (contributor) => ({
        name: '',
        ...contributor,
        user: () => {
          if (contributor?.userId) {
            return context.loaders.User.byId.load(contributor.userId)
          }

          return null
        },
      }),
    )
    const creditString = await stringifyNode(meta.credits?.type, meta.credits)
    if (!creditString) {
      return metaContributors
    }

    let creditContributors
    try {
      creditContributors = new Analyzer().getAnalysis(creditString).contributors
    } catch (e) {
      console.error('[Meta] creditContributors lexing failed', creditString, e)
      return metaContributors
    }

    let creditContributorsUserLinks = await getContributorUserLinks(
      meta.credits?.type,
      meta,
      context,
    )
    creditContributors = creditContributors.map((contributor) => {
      const userLink = creditContributorsUserLinks.find(
        (c) => c.name === contributor.name,
      )
      if (userLink) {
        // only use once
        creditContributorsUserLinks = creditContributorsUserLinks.filter(
          (c) => c !== userLink,
        )
        return {
          ...contributor,
          user: () => context.loaders.User.byId.load(userLink.id),
        }
      }
      return contributor
    })
    return [...creditContributors, ...metaContributors]
  },

  audioCover: getAudioCover,
}
