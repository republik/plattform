const getDocuments = require('./documents')

module.exports = async (_, args, context) => {
  const {
    path,
    repoId,
    versionName
  } = args

  return getDocuments(_, { path, repoId, versionName }, context)
    .then(docCon => docCon.nodes[0])
}
