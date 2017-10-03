const getDocuments = require('./documents')

module.exports = async (_, args, { user, redis }) => {
  const { slug } = args

  return getDocuments(null, args, { user, redis })
    .then(docs => docs
      .filter(doc => doc.meta && doc.meta.slug && doc.meta.slug === slug)
      .shift()
    )
}
