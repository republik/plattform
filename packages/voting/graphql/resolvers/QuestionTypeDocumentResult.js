const search = require('@orbiting/backend-modules-search/graphql/resolvers/_queries/search')
const getFieldList = require('graphql-list-fields')

module.exports = {
  async document (result, args, context, info) {
    if (result && result.document) {
      return result.document
    }
    if (!result || !result.path) {
      return null
    }
    const fields = getFieldList(info, true)
    const withoutContent = fields.indexOf('content') === -1
    const relatedDocsNamespaces = [
      'meta.series',
      'meta.format',
      'meta.dossier',
      'meta.discussion'
    ]
    const withoutRelatedDocs = !fields.find(field => (
      relatedDocsNamespaces
        .find(namespace => field.startsWith(namespace))
    ))
    return search(null, {
      withoutContent,
      withoutRelatedDocs,
      withoutAggs: true,
      filter: {
        path: result.path,
        type: 'Document'
      }
    }, context)
      .then(docCon => docCon.nodes[0] && docCon.nodes[0].entity)
  }
}
