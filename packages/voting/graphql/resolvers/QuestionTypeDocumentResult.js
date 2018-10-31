const { graphql: { resolvers: { queries: { document: getDocument } } } } = require('@orbiting/backend-modules-documents')

module.exports = {
  async document (result, args, context) {
    if (!result || !result.path) {
      return null
    }
    return getDocument(null, { path: result.path }, context)
  }
}
