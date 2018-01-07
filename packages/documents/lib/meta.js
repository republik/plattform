const visit = require('unist-util-visit')
const { createResolver } = require('./resolve')

const getMeta = doc => {
  if (doc._meta) {
    return doc._meta
  }

  const resolvedFields = {}

  // see _all note in Document.content resolver
  if (doc._all) {
    const resolver = createResolver(doc._all)

    resolvedFields.dossier = resolver(doc.content.meta.dossier)
    resolvedFields.format = resolver(doc.content.meta.format)
    resolvedFields.discussion = resolver(doc.content.meta.discussion)
  }

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
