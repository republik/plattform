const { stringify } = require('@republik/remark-preset')
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

const {
  canDerive: canDeriveSyntheticReadAloud,
  applyAssetsAudioUrl,
} = require('../../lib/Derivative/SyntheticReadAloud')

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
    const { id } = commit
    const { type, content } = await context.loaders.Commit.byIdContent.load(id)

    if (type !== 'mdast') {
      return '(keine Markdown-Version verfügbar)'
    }

    return stringify(content)
  },
  document: async (commit, { publicAssets = false }, context) => {
    const { id, repoId, document } = commit
    if (document) {
      return document
    }

    const { type, content } = await context.loaders.Commit.byIdContent.load(id)

    const prefix = createRepoUrlPrefixer(repoId, publicAssets)
    const proxy = createProxyUrlPrefixer()

    await Promise.all([
      processRepoImageUrlsInContent(content, prefix),
      processRepoImageUrlsInMeta(content, prefix),
      processEmbedsInContent(content, proxy, context),
    ])

    return {
      id: Buffer.from(`${commit.repoId}/${commit.id}/preview`).toString(
        'base64',
      ),
      repoId,
      type,
      content,
    }
  },
  derivatives: async (commit, args, context) => {
    const derivatives = await context.loaders.Derivative.byCommitId.load(
      commit.id,
    )

    return derivatives.map(applyAssetsAudioUrl)
  },
  associatedDerivative: async (commit, args, context) => {
    const commitWithSynthReadAloud =
      await context.pgdb.publikator.commitsWithSynthReadAloud.findOne({
        commitId: commit.id,
      })

    if (!commitWithSynthReadAloud) {
      return null
    }

    const associatedDerivative = await context.loaders.Derivative.byId.load(
      commitWithSynthReadAloud.derivativeId,
    )

    if (!associatedDerivative) {
      return null
    }

    return applyAssetsAudioUrl(associatedDerivative)
  },
  canDerive: async (commit, args) => {
    const { type } = args

    if (type === 'SyntheticReadAloud') {
      return canDeriveSyntheticReadAloud(commit.meta)
    }

    return false
  },
}
