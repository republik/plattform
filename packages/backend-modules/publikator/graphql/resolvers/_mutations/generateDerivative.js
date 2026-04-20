const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const {
  canDerive: canDeriveSyntheticReadAloud,
  derive: deriveSyntheticReadAloud,
  applyAssetsAudioUrl,
} = require('../../../lib/Derivative/SyntheticReadAloud')

const {
  lib: {
    resolve: { metaFieldResolver },
  },
} = require('@orbiting/backend-modules-documents')

const {
  lib: {
    Documents: { getElasticDoc, addRelatedDocs },
  },
} = require('@orbiting/backend-modules-search')

const { document: getDocument } = require('../Commit')

const {
  associateReadAloudDerivativeWithCommit,
} = require('../../../lib/Derivative/associateReadAloudDerivativeWithCommit')

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

  // Resolve format — same approach as publish.js
  const connection = {
    nodes: [
      {
        type: 'Document',
        entity: await getElasticDoc({ indexType: 'Document', doc }),
      },
    ],
  }

  await addRelatedDocs({
    connection,
    context,
  })

  const { _all } = connection.nodes[0].entity

  const resolved = metaFieldResolver(doc.content.meta, _all)

  doc.content.meta.format = resolved.format?.meta
    ? { meta: resolved.format.meta }
    : null

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
