const getDocuments = require('./documents')

module.exports = async (_, args, context) => {
  const {
    path,
    repoId
  } = args

  return getDocuments(_, { path, repoId }, context)
    .then(docCon => docCon.nodes[0])
}
