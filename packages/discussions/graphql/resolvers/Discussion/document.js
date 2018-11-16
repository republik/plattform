const { graphql: { resolvers: { queries: { document: getDocument } } } } = require('@orbiting/backend-modules-documents')

module.exports = async ({ repoId }, _, context) => {
  if (!repoId) {
    return null
  }
  return getDocument(null, { repoId }, context)
}
