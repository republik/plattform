const getDocuments = require('./documents')

module.exports = async (_, args, context) => {
  const {
    id,
    path,
    repoId
  } = args

  return getDocuments(_, { id, path, repoId }, context)
    .then(docCon => docCon.nodes[0])
}
