const getDocuments = require('./documents')

module.exports = async (_, args, { user, redis }) => {
  const { slug } = args

  return getDocuments(_, {
    slug
  }, { user, redis }).then(docCon => docCon.nodes[0])
}
