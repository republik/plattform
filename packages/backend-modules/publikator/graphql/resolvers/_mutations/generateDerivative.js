const { document: getDocument } = require('../Commit')

const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const {
  canDerive: canDeriveSyntheticReadAloud,
  derive: deriveSyntheticReadAloud,
  applyAssetsAudioUrl,
} = require('../../../lib/Derivative/SyntheticReadAloud')

const {
  associateReadAloudDerivativeWithCommit,
} = require('../../../lib/Derivative/associateReadAloudDerivativeWithCommit')

const resolveMetaLink = require('../../lib/resolveMetaLink')

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

  // Resolve format name (no elastic needed)
  const formatUrl = doc.content.meta.format
  if (formatUrl && typeof formatUrl === 'string') {
    const formatDoc = await resolveMetaLink(formatUrl, context)
    if (formatDoc?.content?.meta) {
      doc.content.meta.format = {
        meta: {
          title: formatDoc.content.meta.title,
        },
      }
    }
  }

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
