const visit = require('unist-util-visit')
const { metaFieldResolver } = require('./resolve')

const getMeta = doc => {
  if (doc._meta) {
    return doc._meta
  }

  // see _all note in Document.content resolver
  const resolvedFields = doc._all
    ? metaFieldResolver(doc.content.meta, doc._all)
    : { }

  let credits = []
  visit(doc.content, 'zone', node => {
    if (node.identifier === 'TITLE') {
      const paragraphs = node.children
        .filter(child => child.type === 'paragraph')
      if (paragraphs.length >= 2) {
        credits = paragraphs[paragraphs.length - 1].children
      }
    }
  })

  doc._meta = {
    ...doc.content.meta,
    credits,
    ...resolvedFields
  }
  return doc._meta
}

module.exports = {
  getMeta
}
