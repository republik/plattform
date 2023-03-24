const { metaFieldResolver } = require('../common/resolve')

const getMeta = async (doc) => {
  // If {doc._meta} is present, this indicates meta information was retrieved
  // already.
  if (doc._meta) {
    return doc._meta
  }

  // see _all note in Document.content resolver
  const resolvedFields =
    doc._all || doc._users
      ? metaFieldResolver(doc.content.meta, doc._all, doc._users)
      : {}

  // Dummy credits in meta necessary
  const credits = {
    type: 'slate',
    children: [],
  }

  doc._meta = {
    ...doc.content.meta,
    ...resolvedFields,
    credits,
  }

  return doc._meta
}

const getContributors = () => []

module.exports = {
  getMeta,
  getContributors,
}
