const {
  contentUrlResolver,
  metaUrlResolver
} = require('../../lib/resolve')
const { getMeta } = require('../../lib/meta')

module.exports = {
  content (doc, { urlPrefix }, context, info) {
    // we only do auto slugging when in a published documents context
    // - this is easiest dedectable by _all being present from documents resolver
    // - alt check info.path for documents / document being the root
    //   https://gist.github.com/tpreusse/f79833a023706520da53647f9c61c7f6
    if (doc._all) {
      contentUrlResolver(doc, doc._all, doc._usernames, null, urlPrefix)
    }
    return doc.content
  },
  meta (doc, { urlPrefix }, context, info) {
    const meta = getMeta(doc)
    if (doc._all) {
      metaUrlResolver(meta, doc._all, doc._usernames, null, urlPrefix)
    }
    return meta
  }
}
