const getDocuments = require('./documents')

module.exports = async (_, args, context) => {
  const { slug } = args

  return getDocuments(_, { slug }, context)
    .then(docCon => docCon.nodes[0])
}
