const visit = require('unist-util-visit')
const debug = require('debug')('publikator:lib:Document')
const mp3Duration = require('@rocka/mp3-duration')
const fetch = require('isomorphic-unfetch')
const Promise = require('bluebird')

const { timeFormat } = require('@orbiting/backend-modules-formats')
const { mdastToString } = require('@orbiting/backend-modules-utils')
const {
  Redirections: { upsert: upsertRedirection },
} = require('@orbiting/backend-modules-redirections')
const {
  getAuthorUserIds,
} = require('@orbiting/backend-modules-documents/lib/meta')

const { upsert: upsertDiscussion } = require('./Discussion')
const { updateRepo } = require('./postgres')

const slugDateFormat = timeFormat('%Y/%m/%d')

const { PREFIX_PREPUBLICATION_PATH, SUPPRESS_AUDIO_DURATION_MEASURE } = process.env

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
  notifySubscribers,
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

  const creditsString = mdastToString({ children: credits })

  const { audioSourceMp3, audioSourceAac, audioSourceOgg } = doc.content.meta
  let durationMs = 0
  if (audioSourceMp3 && !SUPPRESS_AUDIO_DURATION_MEASURE) {
    debug(repoId, 'fetching audio source', audioSourceMp3)
    durationMs = await fetch(audioSourceMp3)
      .then((res) => res.buffer())
      .then((res) => mp3Duration(res))
      .then((res) => res * 1000)
      .then(Math.round)
      .catch((e) => {
        console.error(
          `Could not download/measure audioSourceMp3 (${audioSourceMp3})`,
          e,
        )
        return 0
      })
  }
  const audioSource =
    audioSourceMp3 || audioSourceAac || audioSourceOgg
      ? {
          mediaId: Buffer.from(`${repoId}/audio`).toString('base64'),
          mp3: audioSourceMp3,
          aac: audioSourceAac,
          ogg: audioSourceOgg,
          durationMs,
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

  const authors = credits
    .filter((c) => c.type === 'link')
    .map((a) => a.children[0].value)

  const authorUserIds = await getAuthorUserIds(null, context, credits)

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
    notifySubscribers,
    creditsString,
    credits,
    audioSource,
    authors,
    authorUserIds,
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
    debug('upsertRedirection', { source: previousPath, target: newPath, repoId })
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
