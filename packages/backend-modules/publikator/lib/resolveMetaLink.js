const {
  lib: { resolve },
} = require('@orbiting/backend-modules-documents')

const { document: getDocument } = require('../graphql/resolvers/Commit')

module.exports = async (url, context) => {
  const { repoId } = resolve.getRepoId(url)
  if (!repoId) {
    return null
  }

  const latestCommit = await context.loaders.Commit.byRepoIdLatest.load(repoId)
  return (
    (latestCommit && (await getDocument(latestCommit, {}, context))) || null
  )
}

