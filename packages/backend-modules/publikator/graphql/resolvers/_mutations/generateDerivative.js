const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const {
  canDerive: canDeriveSyntheticReadAloud,
  derive: deriveSyntheticReadAloud,
  applyAssetsAudioUrl,
} = require('../../../lib/Derivative/SyntheticReadAloud')

const { document: getDocument } = require('../Commit')

const { associateReadAloudDerivativeWithCommit } = require('../../../lib/Derivative/associateReadAloudDerivativeWithCommit')

module.exports = async (_, { commitId }, context) => {
  const { user, pgdb, loaders, pubsub, t } = context
  ensureUserHasRole(user, 'editor')

  const commit = await loaders.Commit.byId.load(commitId)

  if (!commit) {
    throw new Error(t('api/publikator/generateDerivative/commit/404'))
  }

  if (!canDeriveSyntheticReadAloud(commit.meta)) {
    throw new Error(t('api/publikator/generateDerivative/canNot'))
  }

  const doc = await getDocument(commit, {}, context)
  const derivative = await deriveSyntheticReadAloud(
    doc,
    { force: true },
    pgdb,
    user,
  )

  if (!derivative) {
    throw new Error(t('api/publikator/generateDerivative/unable'))
  }

  await associateReadAloudDerivativeWithCommit(derivative, commit, pgdb)

  await pubsub.publish('repoChange', {
    repoChange: {
      repoId: commit.repoId,
      mutation: 'UPDATED',
      commit,
    },
  })

  return applyAssetsAudioUrl(derivative)
}
