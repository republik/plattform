const { metaFieldResolver } = require('./resolve')

const getMeta = doc => {
  if (doc._meta) {
    return doc._meta
  }

  // see _all note in Document.content resolver
  const resolvedFields = doc._all
    ? metaFieldResolver(doc.content.meta, doc._all)
    : { }

  doc._meta = {
    ...doc.content.meta,
    ...resolvedFields
  }
  return doc._meta
}

module.exports = {
  getMeta
}
