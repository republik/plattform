const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const {
  canDerive: canDeriveSyntheticReadAloud,
  derive: deriveSyntheticReadAloud,
} = require('../../../lib/Derivative/SyntheticReadAloud')

const { document: getDocument } = require('../Commit')

module.exports = async (_, { commitId }, context) => {
  const { user, loaders, pubsub, t } = context
  ensureUserHasRole(user, 'editor')

  const commit = await loaders.Commit.byId.load(commitId)
  if (!commit) {
    throw new Error(t('api/publikator/generateDerivative/commit/404'))
  }

  if (!canDeriveSyntheticReadAloud(commit.meta.template)) {
    throw new Error(t('api/publikator/generateDerivative/canNot'))
  }

  const doc = await getDocument(commit, {}, context)
  const derivative = await deriveSyntheticReadAloud(doc, context)
  if (!derivative) {
    throw new Error(t('api/publikator/generateDerivative/unable'))
  }

  await pubsub.publish('repoChange', {
    repoChange: {
      repoId: commit.repoId,
      mutation: 'UPDATED',
      commit,
      derivative,
    },
  })

  return derivative
}
