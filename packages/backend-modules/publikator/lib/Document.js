const visit = require('unist-util-visit')
const debug = require('debug')('publikator:lib:Document')
const Promise = require('bluebird')

const { timeFormat } = require('@orbiting/backend-modules-formats')
const {
  Redirections: { upsert: upsertRedirection },
} = require('@orbiting/backend-modules-redirections')
const { getMeta } = require('@orbiting/backend-modules-documents/lib/meta')

const { upsert: upsertDiscussion } = require('./Discussion')
const { updateRepo } = require('./postgres')

const slugDateFormat = timeFormat('%Y/%m/%d')

const { PREFIX_PREPUBLICATION_PATH } = process.env

// @see GraphQL schema-types enum AudioSourceKind
const getAudioSourceKind = (string) =>
  ['podcast', 'readAloud', 'syntheticReadAloud'].includes(string)
    ? string
    : null

const getPath = ({ slug, template, publishDate, prepublication, path }) => {
  if (path) {
    const parts = [
      !!prepublication && PREFIX_PREPUBLICATION_PATH,
      ...path.split('/'),
    ]

    return `/${parts.filter(Boolean).join('/')}`
  }

  const cleanedSlug =
    slug && slug.indexOf('/') > -1
      ? new RegExp(/.*\/(.*)/g).exec(slug)[1] // ignore everything before the last /
      : slug

  const useSlugDate = ![
    'front',
    'section',
    'page',
    'dossier',
    'format',
  ].includes(template)

  const parts = [
    !!prepublication && PREFIX_PREPUBLICATION_PATH,
    useSlugDate && slugDateFormat(publishDate),
    template === 'dossier' && 'dossier',
    template === 'format' && 'format',
    cleanedSlug || '',
    template === 'discussion' && 'diskussion',
  ]

  return `/${parts.filter(Boolean).join('/')}`
}

// TODO this can move to packages/search as soon as redis is out
const prepareMetaForPublish = async ({
  repoId,
  repoMeta,
  scheduledAt,
  lastPublishedAt,
  prepublication,
  doc,
  now = new Date(),
  context,
}) => {
  const docMeta = doc.content.meta

  let publishDate = repoMeta.publishDate ? new Date(repoMeta.publishDate) : null
  let savePublishDate
  if (!publishDate) {
    publishDate = docMeta.publishDate
      ? new Date(docMeta.publishDate)
      : new Date(scheduledAt || now)
    savePublishDate = true
  }

  const path = getPath({
    ...docMeta,
    publishDate,
    prepublication,
  })

  // discussionId is not saved to repoMeta anymore, but repoId to discussion
  // see Meta.ownDiscussion resolver
  if (!scheduledAt && !prepublication) {
    await upsertDiscussion(
      { ...docMeta, path, repoId },
      context,
      repoMeta.discussionId,
    )
  }

  if (savePublishDate) {
    await updateRepo(repoId, { publishDate }, context.pgdb)
  }

  const {
    audioSourceKind,
    audioSourceMp3,
    audioSourceAac,
    audioSourceOgg,
    audioSourceDurationMs,
    audioSourceByteSize,
  } = doc.content.meta

  const audioSource =
    audioSourceMp3 || audioSourceAac || audioSourceOgg
      ? {
          mediaId: Buffer.from(`${repoId}/audio`).toString('base64'),
          kind: getAudioSourceKind(audioSourceKind),
          mp3: audioSourceMp3,
          aac: audioSourceAac,
          ogg: audioSourceOgg,
          durationMs: audioSourceDurationMs,
          byteSize: audioSourceByteSize,
        }
      : null

  // hasAudio: either audioSource or audio-only-video in content
  // hasVideo: at least one non audio-only-video in content
  let hasAudio = !!audioSource
  let hasVideo = false
  visit(doc.content, 'zone', (node) => {
    if (node.data && node.identifier === 'EMBEDVIDEO') {
      if (node.data.forceAudio) {
        hasAudio = true
      } else {
        hasVideo = true
      }
    }
  })

  const isSeriesMaster = typeof docMeta.series === 'object'
  const isSeriesEpisode = typeof docMeta.series === 'string'

  // map series episodes to the key seriesEpisodes to have consistent types
  // and not having to touch the series key
  let seriesEpisodes
  if (typeof docMeta.series === 'object') {
    const { title, description, episodes } = docMeta.series
    seriesEpisodes = {
      title,
      description,
      episodes: episodes.map((episode) => {
        if (episode.publishDate === '') {
          episode.publishDate = null
        }

        return episode
      }),
    }
  }

  await getMeta(doc)
  const { credits, creditsString, contributors } = doc._meta

  // transform docMeta
  return {
    ...docMeta,
    feed:
      docMeta.feed ||
      (docMeta.feed === undefined && docMeta.template === 'article'),
    repoId,
    path,
    publishDate,
    lastPublishedAt: lastPublishedAt || now,
    prepublication,
    scheduledAt,
    audioSource,
    credits,
    creditsString,
    contributors,
    isSeriesMaster,
    isSeriesEpisode,
    seriesEpisodes,
    hasAudio,
    hasVideo,
  }
}

// if the requirements for context change you need to
// adapt lib/PublicationScheduler
const handleRedirection = async (repoId, newDocMeta, context) => {
  const {
    lib: {
      Documents: { findPublications },
    },
  } = require('@orbiting/backend-modules-search')

  const newPath = newDocMeta.path
  const { elastic } = context

  const docs = await findPublications(elastic, repoId)

  const previousPaths = docs
    .map((doc) => doc.meta.path)
    .filter((path) => path !== newPath)

  if (!previousPaths.length) {
    return
  }

  await Promise.each([...new Set(previousPaths)], (previousPath) => {
    debug('upsertRedirection', {
      source: previousPath,
      target: newPath,
      repoId,
    })
    return upsertRedirection(
      {
        source: previousPath,
        target: newPath,
        resource: { repo: { id: repoId } },
      },
      context,
    )
  })
}

module.exports = {
  getPath,
  prepareMetaForPublish,
  handleRedirection,
}
