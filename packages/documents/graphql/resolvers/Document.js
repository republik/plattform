const visit = require('unist-util-visit')
const { createAutoSlug } = require('../../lib/resolve')
const { getMeta } = require('../../lib/meta')

module.exports = {
  content (doc, args, context, info) {
    // we only do auto slugging when in a published documents context
    // - this is easiest dedectable by _all being present from documents resolver
    // - alt check info.path for documents / document being the root
    //   https://gist.github.com/tpreusse/f79833a023706520da53647f9c61c7f6
    if (doc._all) {
      const autoSlug = createAutoSlug(doc._all)

      visit(doc.content, 'link', node => {
        node.url = autoSlug(node.url)
      })
      visit(doc.content, 'zone', node => {
        if (node.data) {
          node.data.url = autoSlug(node.data.url)
        }
      })
    }

    return doc.content
  },
  meta (doc, args, context, info) {
    return getMeta(doc)
  }
}
