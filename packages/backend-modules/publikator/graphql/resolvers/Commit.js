const {
  lib: { createRepoUrlPrefixer, createProxyUrlPrefixer },
} = require('@orbiting/backend-modules-assets')
const {
  lib: {
    process: {
      processRepoImageUrlsInContent,
      processRepoImageUrlsInMeta,
      processEmbedsInContent,
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

    const prefix = createRepoUrlPrefixer(repoId, publicAssets)
    const proxy = createProxyUrlPrefixer()

    await Promise.all([
      processRepoImageUrlsInContent(mdast, prefix),
      processRepoImageUrlsInMeta(mdast, prefix),
      processEmbedsInContent(mdast, proxy, context),
    ])

    return {
      id: Buffer.from(`${commit.repoId}/${commit.id}/preview`).toString(
        'base64',
      ),
      repoId,
      content: mdast,
    }
  },
  derivatives: async (commit, args, context) =>
    context.loaders.Derivative.byCommitId.load(commit.id),
}
