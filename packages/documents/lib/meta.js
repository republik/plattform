const visit = require('unist-util-visit')

const { metaFieldResolver } = require('./resolve')

/**
 * If not available already, assign credits to doc.content.meta.
 *
 * @param  {Object} doc An MDAST tree
 * @return {Object}     Returns maybe altered {doc}
 */
const ensureCredits = doc => {
  if (!doc.content.meta.credits) {
    visit(doc.content, 'zone', node => {
      if (node.identifier === 'TITLE') {
        const paragraphs = node.children
          .filter(child => child.type === 'paragraph')
        if (paragraphs.length >= 2) {
          Object.assign(
            doc.content.meta,
            { credits: paragraphs[paragraphs.length - 1].children }
          )
        }
      }
    })
  }

  return doc
}

const getMeta = doc => {
  if (doc._meta) {
    return doc._meta
  }

  // see _all note in Document.content resolver
  const resolvedFields = doc._all
    ? metaFieldResolver(doc.content.meta, doc._all)
    : { }

  ensureCredits(doc)

  const { audioSourceMp3, audioSourceAac, audioSourceOgg } = doc.content.meta
  const audioSource = audioSourceMp3 || audioSourceAac || audioSourceOgg ? {
    mp3: audioSourceMp3,
    aac: audioSourceAac,
    ogg: audioSourceOgg
  } : null

  doc._meta = {
    ...doc.content.meta,
    ...resolvedFields,
    audioSource
  }

  return doc._meta
}

module.exports = {
  getMeta
}
