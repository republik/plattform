const {
  lib: {
    resolve
  }
} = require('@orbiting/backend-modules-documents')

const repo = require('./Repo')
const commit = require('./Commit')

const resolveRepoId = field => async (meta, args, context) => {
  const repoId = resolve.getRepoId(meta[field])
  if (!repoId) {
    return null
  }

  const latestCommit = await repo.latestCommit({id: repoId})
  const doc = await commit.document(latestCommit, {}, context)

  return doc || null
}

module.exports = {
  format: resolveRepoId('format'),
  discussion: resolveRepoId('discussion'),
  dossier: resolveRepoId('dossier')
}
