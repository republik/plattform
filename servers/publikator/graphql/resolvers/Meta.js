const {
  lib: {
    resolve
  }
} = require('@orbiting/backend-modules-documents')

const repo = require('./Repo')
const commit = require('./Commit')

const resolveRepoId = field => async (meta, args, context) => {
  if (typeof meta[field] === 'object') {
    return meta[field]
  }

  const repoId = resolve.getRepoId(meta[field])
  if (!repoId) {
    return null
  }

  const latestCommit = await repo.latestCommit({ id: repoId }, null, context)
  const doc = await commit.document(latestCommit, {}, context)

  return doc || null
}

module.exports = {
  format: resolveRepoId('format'),
  dossier: resolveRepoId('dossier')
}
