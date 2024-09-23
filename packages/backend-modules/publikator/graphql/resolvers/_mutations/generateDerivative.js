const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const {
  canDerive: canDeriveSyntheticReadAloud,
  derive: deriveSyntheticReadAloud,
  applyAssetsAudioUrl,
} = require('../../../lib/Derivative/SyntheticReadAloud')

const { document: getDocument } = require('../Commit')

module.exports = async (_, { commitId }, context) => {
  const { user, pgdb, loaders, pubsub, t } = context
  ensureUserHasRole(user, 'editor')

  const commit = await loaders.Commit.byId.load(commitId)

  console.log('--1--', commit)

  if (!commit) {
    throw new Error(t('api/publikator/generateDerivative/commit/404'))
  }

  if (!canDeriveSyntheticReadAloud(commit.meta)) {
    throw new Error(t('api/publikator/generateDerivative/canNot'))
  }

  console.log('--2--')

  const doc = await getDocument(commit, {}, context)
  const derivative = await deriveSyntheticReadAloud(
    doc,
    { force: true },
    pgdb,
    user,
  )

  console.log('--3--')

  if (!derivative) {
    throw new Error(t('api/publikator/generateDerivative/unable'))
  }

  console.log('--4--')

  await pubsub.publish('repoChange', {
    repoChange: {
      repoId: commit.repoId,
      mutation: 'UPDATED',
      commit,
    },
  })

  console.log('--5--')

  return applyAssetsAudioUrl(derivative)
}
