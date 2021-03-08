const {
  lib: { createRepoUrlPrefixer, createUrlPrefixer },
} = require('@orbiting/backend-modules-assets')
const {
  lib: {
    process: {
      processRepoImageUrlsInContent,
      processRepoImageUrlsInMeta,
      processImageUrlsInContent,
    },
  },
} = require('@orbiting/backend-modules-documents')

module.exports = {
  author: async (commit, args, context) => {
    const user =
      commit.userId && (await context.loaders.User.byId.load(commit.userId))

    if (user) {
      return {
        name: [user.firstName, user.lastName].join(' ').trim() || user.email,
        email: user.email,
        user,
      }
    }

    return {
      name: commit.author.name,
      email: commit.author.email,
    }
  },
  markdown: async (commit, args, context) => {
    const { markdown } = await context.loaders.Commit.byIdMarkdown.load(
      commit.id,
    )

    return markdown
  },
  document: async (commit, { publicAssets = false }, context) => {
    const { repoId, document: existingDocument } = commit
    if (existingDocument) {
      return existingDocument
    }

    const { mdast } = await context.loaders.Commit.byIdMdast.load(commit.id)

    const prefixRepoUrl = createRepoUrlPrefixer(repoId, publicAssets)
    processRepoImageUrlsInContent(mdast, prefixRepoUrl)
    processRepoImageUrlsInMeta(mdast, prefixRepoUrl)

    // prefix embed image's urls
    const prefixUrl = createUrlPrefixer(publicAssets)
    processImageUrlsInContent(mdast, prefixUrl)

    return {
      id: Buffer.from(`repo:${commit.repoId}:${commit.id}`).toString('base64'),
      repoId,
      content: mdast,
    }
  },
}
