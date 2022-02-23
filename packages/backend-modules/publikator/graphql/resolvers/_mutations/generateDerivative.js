const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const { handleSyntheticReadAloud } = require('../../../lib/Document')

const { document: getDocument } = require('../Commit')

module.exports = async (_, { commitId }, context) => {
  const { user, loaders, pubsub } = context
  ensureUserHasRole(user, 'editor')

  const commit = await loaders.Commit.byId.load(commitId)
  // const { meta: repoMeta } = await context.loaders.Repo.byId.load(repoId)

  // load and check document
  const doc = await getDocument(
    commit, // { id: commitId, repo: { id: repoId }, repoId },
    {},
    context,
  )

  const derivative = await handleSyntheticReadAloud(doc, context)

  if (derivative) {
    await pubsub.publish('repoChange', {
      repoChange: {
        repoId: commit.repoId,
        mutation: 'UPDATED',
        commit,
        derivative,
      },
    })
  }

  return derivative
}
