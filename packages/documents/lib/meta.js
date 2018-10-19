const visit = require('unist-util-visit')

const { metaFieldResolver } = require('./resolve')

/**
 * Obtain credits from either {doc.content.children} or {doc.meta}.
 *
 * @param  {Object} doc An MDAST tree
 * @return {Array}      MDAST children
 */
const getCredits = doc => {
  // If {doc.content} is available, always obtain credits from it.
  if (doc.content && doc.content.children) {
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

    return credits
  }

  // Due to perfomance considerations a {doc} might come in without
  // {doc.content}, or only {doc.content.meta} without credits is provided (to
  // resolve). In such a case, we look for {doc.meta.credits} to obtain credits.
  return (doc.meta && doc.meta.credits) || []
}

/**
 * Builds and an audioSource object from {doc.content.meta} for use in meta.
 *
 * @param  {Object}      doc An MDAST tree
 * @return {Object|null}     e.g. { mp3: true, aac: null, ogg: null }
 */
const getAudioSource = doc => {
  if (!doc.content && doc.meta && doc.meta.audioSource) {
    return doc.meta.audioSource
  }
  const { audioSourceMp3, audioSourceAac, audioSourceOgg } = doc.content.meta
  const audioSource = audioSourceMp3 || audioSourceAac || audioSourceOgg ? {
    mp3: audioSourceMp3,
    aac: audioSourceAac,
    ogg: audioSourceOgg
  } : null

  return audioSource
}

/**
 * Prepares meta information and resolves linked documents in meta which are
 * not available in original {doc.content.meta} fields.
 *
 * @param  {Object}      doc An MDAST tree
 * @return {Object|null}     e.g. { audioSource: null, auto: true, [...] }
 */
const getMeta = doc => {
  // If {doc._meta} is present, this indicates meta information was retrieved
  // already.
  if (doc._meta) {
    return doc._meta
  }

  // see _all note in Document.content resolver
  const resolvedFields = doc._all
    ? metaFieldResolver(doc.content.meta, doc._all)
    : {}

  // Populate {doc._meta}. Is used to recognize provided {doc} for which meta
  // information was retrieved already.
  doc._meta = {
    ...doc.content.meta,
    credits: getCredits(doc),
    audioSource: getAudioSource(doc),
    ...resolvedFields
  }

  return doc._meta
}

module.exports = {
  getMeta
}
