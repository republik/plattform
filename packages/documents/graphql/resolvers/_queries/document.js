const getDocuments = require('./documents')

module.exports = async (_, args, context) => {
  const { path } = args

  return getDocuments(_, { path }, context)
    .then(docCon => docCon.nodes[0])
}
