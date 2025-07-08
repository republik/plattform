const { getRepoId } = require('./resolve')
const visit = require('unist-util-visit')
const { v4: isUuid } = require('is-uuid')

const {
  Analyzer,
} = require('@orbiting/backend-modules-statistics/lib/credits/analyzer')

const { stringifyNode, metaFieldResolver } = require('./resolve')

// mean German, see http://iovs.arvojournals.org/article.aspx?articleid=2166061
const WORDS_PER_MIN = 180

const { SUPPRESS_READING_MINUTES } = process.env

let suppressReadingMinutes

try {
  suppressReadingMinutes =
    SUPPRESS_READING_MINUTES && JSON.parse(SUPPRESS_READING_MINUTES)

  if (suppressReadingMinutes) {
    console.warn(
      'WARNING: Suppressing Document.meta.estimatedReadingMinutes with %O',
      suppressReadingMinutes,
    )
  }
} catch (e) {
  console.error('SUPPRESS_READING_MINUTES config parse error', e)
}

/**
 * Builds and an audioSource object from {doc.content.meta} for use in meta.
 * Publish uses packages/publikator/lib/Document.prepareMetaForPublish instead
 *
 * @param  {Object}      doc An MDAST tree
 * @return {Object|null}     e.g. { mp3: true, aac: null, ogg: null }
 */
const getAudioSource = (doc) => {
  // after publish
  if (doc.meta && doc.meta.audioSource) {
    return doc.meta.audioSource
  }
  // before published - render in publikator (preview)
  const { audioSourceKind, audioSourceMp3, audioSourceAac, audioSourceOgg } =
    doc.content.meta
  const audioSource =
    audioSourceMp3 || audioSourceAac || audioSourceOgg
      ? {
          kind: audioSourceKind,
          mp3: audioSourceMp3,
          aac: audioSourceAac,
          ogg: audioSourceOgg,
        }
      : null

  return audioSource
}

const getAudioCover = (meta, args) => {
  const [metaImage, metaAudioCoverCrop] =
    // check doc itself
    (meta?.image && [meta.image, meta.audioCoverCrop]) ||
    // check linked format
    (meta?.format?.meta?.image && [
      meta.format.meta.image,
      meta.format.meta.audioCoverCrop,
    ]) ||
    // check share background (inverted)
    (meta?.format?.meta?.shareBackgroundImageInverted && [
      meta.format.meta.shareBackgroundImageInverted,
      { x: 0, y: 0, width: 50, height: 100 },
    ]) ||
    // check share background
    (meta?.format?.meta?.shareBackgroundImage && [
      meta.format.meta.shareBackgroundImage,
      { x: 0, y: 0, width: 50, height: 100 },
    ]) ||
    []

  if (!metaImage) {
    return null
  }

  const { properties } = args ?? {}

  // resize image
  const resize =
    ((properties?.width || properties?.height) &&
      [properties.width ?? '', properties.height ?? ''].join('x')) ||
    '1000x1000'

  // greyscale image
  const bw = properties?.bw ?? false

  // desired output format
  const format = properties?.format

  // optional background color
  const bg = properties?.bg

  // optional postfix
  const postfix = properties?.postfix

  try {
    const url = new URL(metaImage)

    if (metaAudioCoverCrop && url.searchParams.has('size')) {
      const { x, y, width, height } = metaAudioCoverCrop

      url.searchParams.set('crop', `${x}x${y}y${width}w${height}h`)
    }

    url.searchParams.set('resize', resize)
    url.searchParams.set('bw', bw ? '1' : '')
    url.searchParams.set('format', format || 'auto')
    bg && url.searchParams.set('bg', bg)
    postfix && url.searchParams.set('postfix', postfix)

    return url.toString()
  } catch (e) {
    console.warn(
      `documents/lib/common/meta %s unparsable: %s`,
      metaImage,
      e.message,
    )
    return null
  }
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
const getEstimatedReadingMinutes = (doc) => {
  const count =
    (doc._storedFields && doc._storedFields['contentString.count']) || false
  if (count && count[0] > getWordsPerMinute()) {
    return Math.round(count[0] / getWordsPerMinute())
  }
  return null
}

const isReadingMinutesSuppressed = (fields, resolvedFields) =>
  suppressReadingMinutes &&
  // Paths
  ((fields.path &&
    suppressReadingMinutes.paths &&
    suppressReadingMinutes.paths.includes(fields.path)) ||
    // Series
    (resolvedFields.series &&
      resolvedFields.series.title &&
      suppressReadingMinutes.series &&
      suppressReadingMinutes.series.includes(resolvedFields.series.title)) ||
    // Formats
    (resolvedFields.format &&
      resolvedFields.format.meta &&
      resolvedFields.format.meta.repoId &&
      suppressReadingMinutes.formats &&
      suppressReadingMinutes.formats.includes(
        resolvedFields.format.meta.repoId,
      )))

const getEstimatedConsumptionMinutes = (doc, estimatedReadingMinutes) => {
  const durationMs = doc.meta?.audioSource?.durationMs
  const kind = doc.meta?.audioSource?.kind

  // Return audio duration in minutes if audioSource provides duration in ms and
  // audioSource.kind is neither "readAloud" or "syntheticReadAloud". As their an
  // audio representation of written content, these should not be counted towards
  // consumption time.
  const audioDurationMinutes =
    !!durationMs &&
    !['readAloud', 'syntheticReadAloud'].includes(kind) &&
    Math.round(durationMs / (1000 * 60))

  return Math.max(audioDurationMinutes, estimatedReadingMinutes)
}

// doc.repoId, doc._meta is present on unpublished docs
// { repo { commit { document } } }
const getRepoIdsForDoc = (doc, includeParents) =>
  [
    doc.meta?.repoId || doc._meta?.repoId || doc.repoId,
    includeParents &&
      getRepoId(
        doc.meta?.format || doc._meta?.format || doc.content?.meta?.format,
      ).repoId,
  ].filter(Boolean)

const getTemplate = (doc) => doc.meta?.template || doc._meta?.template

/**
 * Obtain credits from either {doc.content.children} or {doc.meta}.
 *
 * @param  {Object} doc An MDAST tree
 * @return {Array}      MDAST children
 */
const getCredits = (doc) => {
  // If {doc.content} is available, always obtain credits from it.
  if (doc.content?.children) {
    let credits = []

    visit(doc.content, 'zone', (node) => {
      if (node.identifier === 'TITLE') {
        const paragraphs = node.children.filter(
          (child) => child.type === 'paragraph',
        )
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
  return doc.meta?.credits?.children || []
}

/**
 * Prepares meta information and resolves linked documents in meta which are
 * not available in original {doc.content.meta} fields.
 *
 * @param  {Object}      doc An MDAST tree
 * @return {Object|null}     e.g. { audioSource: null, auto: true, [...] }
 */
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

  const times = {
    estimatedReadingMinutes: null,
    estimatedConsumptionMinutes: null,
  }

  if (!isReadingMinutesSuppressed(doc.content.meta, resolvedFields)) {
    times.estimatedReadingMinutes = getEstimatedReadingMinutes(doc)
    times.estimatedConsumptionMinutes = getEstimatedConsumptionMinutes(
      doc,
      times.estimatedReadingMinutes,
    )
  }

  // Populate {doc._meta}. Is used to recognize provided {doc} for which meta
  // information was retrieved already.

  const credits = {
    type: 'mdast',
    children: getCredits(doc),
  }

  doc._meta = {
    ...doc.content.meta,
    ...times,
    ...resolvedFields,
    credits,
    creditsString: await stringifyNode(credits),
    audioSource: getAudioSource(doc),
  }

  doc._meta.contributors = getContributors(doc._meta)

  return doc._meta
}

const toContributor = (node) => {
  const contributor = {
    name: stringifyNode(node),
  }

  const identifier = node.url?.startsWith('/~') && node.url.replace(/^\/~/, '')

  if (identifier && isUuid(identifier)) {
    contributor.userId = identifier
  }

  return contributor
}

const getContributors = (meta) => {
  const creditsContributors =
    meta?.credits?.children
      ?.filter((c) => c.type === 'link')
      .map(toContributor)
      .filter(Boolean) || []

  const creditsString = stringifyNode(meta.credits)
  const creditsStringContributors =
    new Analyzer().getAnalysis(creditsString).contributors || []

  const metaContributors = meta?.contributors || []

  const contributors = [
    ...creditsContributors,
    ...creditsStringContributors,
    ...metaContributors,
  ].reduce((contributors, potentialContributor) => {
    const sameAtIndex = contributors?.findIndex(
      (contributor) =>
        contributor.name === potentialContributor.name &&
        (!contributor.kind || contributor.kind === potentialContributor.kind),
    )

    if (sameAtIndex < 0) {
      contributors.push(potentialContributor)
    } else {
      contributors[sameAtIndex] = {
        ...potentialContributor,
        ...contributors[sameAtIndex],
      }
    }

    return contributors
  }, [])

  return contributors
}

module.exports = {
  getAudioCover,
  getWordsPerMinute,
  getRepoIdsForDoc,
  getTemplate,

  getMeta,
  getContributors,
}
