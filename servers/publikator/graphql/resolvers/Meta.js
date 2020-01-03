const {
  lib: {
    resolve
  }
} = require('@orbiting/backend-modules-documents')

const repo = require('./Repo')
const commit = require('./Commit')

const resolveRepoId = field => async (meta, args, context) => {
  // after publication: return fields resolved by documents/Document.meta
  // on series master documents this is the series info
  if (typeof meta[field] === 'object') {
    return meta[field]
  }

  const repoId = resolve.getRepoId(meta[field])
  if (!repoId) {
    return null
  }

  const latestCommit = await repo.latestCommit({ id: repoId }, null, context)
  const doc = await commit.document(latestCommit, {}, context)

  // for series episodes we don't want to return the master
  // document but its meta.series info object
  if (field === 'series' && doc) {
    return doc.content.meta.series
  }

  return doc || null
}

module.exports = {
  format: resolveRepoId('format'),
  section: resolveRepoId('section'),
  dossier: resolveRepoId('dossier'),
  series: resolveRepoId('series')
}
