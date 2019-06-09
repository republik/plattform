const visit = require('unist-util-visit')

const { metaFieldResolver } = require('./resolve')

// mean German, see http://iovs.arvojournals.org/article.aspx?articleid=2166061
const WORDS_PER_MIN = 180

const { SUPPRESS_READING_MINUTES } = process.env

let suppressReadingMinutes

try {
  suppressReadingMinutes =
    SUPPRESS_READING_MINUTES &&
      JSON.parse(SUPPRESS_READING_MINUTES)

  if (suppressReadingMinutes) {
    console.warn(
      'WARNING: Suppressing Document.meta.estimatedReadingMinutes with %O',
      suppressReadingMinutes
    )
  }
} catch (e) {
  console.error('SUPPRESS_READING_MINUTES config parse error', e)
}

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
 * Publish uses servers/publikator/lib/Document.prepareMetaForPublish instead
 *
 * @param  {Object}      doc An MDAST tree
 * @return {Object|null}     e.g. { mp3: true, aac: null, ogg: null }
 */
const getAudioSource = doc => {
  // after publish
  if (doc.meta && doc.meta.audioSource) {
    return doc.meta.audioSource
  }
  // before published - render in publikator (preview)
  const {
    audioSourceMp3,
    audioSourceAac,
    audioSourceOgg
  } = doc.content.meta
  const audioSource = audioSourceMp3 || audioSourceAac || audioSourceOgg ? {
    mp3: audioSourceMp3,
    aac: audioSourceAac,
    ogg: audioSourceOgg
  } : null

  return audioSource
}

const getTotalMediaDurationMinutes = doc => {
  let total = 0
  if (doc.meta && doc.meta.audioSource && doc.meta.audioSource.durationMs) {
    total += doc.meta.audioSource.durationMs
  }
  const ids = {}
  visit(doc.content, 'zone', (node, i, parent) => {
    if (node.identifier === 'EMBEDVIDEO' && node.data && node.data.durationMs && !ids[node.data.id]) {
      total += node.data.durationMs
      ids[node.data.id] = true
    }
  })
  return total && Math.round(total / 1000 / 60)
}

/**
 * Getter of WORDS_PER_MINUTE
 *
 * @return {Number} Returns word count one might be able to read
 */
const getWordsPerMinute = () => WORDS_PER_MIN

/**
 * Returns an estimated amount of minutes, describing how much time a proficient
 * reader needs to invest to read this article.
 *
 * @param  {Object}      doc An MDAST tree
 * @return {Number}      Minutes to read content
 */
const getEstimatedReadingMinutes = doc => {
  const count = (doc._storedFields && doc._storedFields['contentString.count']) || false
  if (count && count[0] > getWordsPerMinute()) {
    return Math.round(
      count[0] / getWordsPerMinute()
    )
  }
  return null
}

const isReadingMinutesSuppressed = (fields, resolvedFields) =>
  suppressReadingMinutes && (
    // Paths
    (
      fields.path &&
      suppressReadingMinutes.paths &&
      suppressReadingMinutes.paths.includes(
        fields.path
      )
    ) ||

    // Series
    (
      resolvedFields.series &&
      resolvedFields.series.title &&
      suppressReadingMinutes.series &&
      suppressReadingMinutes.series.includes(
        resolvedFields.series.title
      )
    ) ||

    // Formats
    (
      resolvedFields.format &&
      resolvedFields.format.meta &&
      resolvedFields.format.meta.repoId &&
      suppressReadingMinutes.formats &&
      suppressReadingMinutes.formats.includes(
        resolvedFields.format.meta.repoId
      )
    )
  )

const getEstimatedConsumptionMinutes = (doc, estimatedReadingMinutes) =>
  doc.meta && doc.meta.audioSource && doc.meta.audioSource.durationMs
    ? Math.round(doc.meta.audioSource.durationMs / 1000 / 60)
    : estimatedReadingMinutes

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

  const readingMinutesSuppressed = isReadingMinutesSuppressed(doc.content.meta, resolvedFields)
  const estimatedReadingMinutes = !readingMinutesSuppressed
    ? getEstimatedReadingMinutes(doc)
    : null

  const times = !readingMinutesSuppressed
    ? {
      estimatedReadingMinutes,
      totalMediaMinutes: getTotalMediaDurationMinutes(doc),
      estimatedConsumptionMinutes: getEstimatedConsumptionMinutes(doc, estimatedReadingMinutes)
    }
    : {}

  // Populate {doc._meta}. Is used to recognize provided {doc} for which meta
  // information was retrieved already.
  doc._meta = {
    ...doc.content.meta,
    credits: getCredits(doc),
    audioSource: getAudioSource(doc),
    ...times,
    ...resolvedFields
  }

  return doc._meta
}

module.exports = {
  getMeta,
  getWordsPerMinute
}
