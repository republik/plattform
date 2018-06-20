const editRepoMeta = require('../graphql/resolvers/_mutations/editRepoMeta')
const { upsert: upsertDiscussion } = require('./Discussion')
const visit = require('unist-util-visit')
const debug = require('debug')('publikator:lib:Document')

const { timeFormat } = require('@orbiting/backend-modules-formats')
const {
  Redirections: { upsert: upsertRedirection }
} = require('@orbiting/backend-modules-redirections')
const slugDateFormat = timeFormat('%Y/%m/%d')

const getPath = (docMeta) => {
  const { slug, template, publishDate } = docMeta
  const cleanedSlug = slug && slug.indexOf('/') > -1
    ? new RegExp(/.*\/(.*)/g).exec(slug)[1] // ignore everything before the last /
    : slug
  switch (template) {
    case 'front':
      return `/${cleanedSlug || ''}`
    case 'dossier':
      return `/dossier/${cleanedSlug}`
    case 'format':
      return `/format/${cleanedSlug}`
    case 'discussion':
      return `/${slugDateFormat(publishDate)}/${cleanedSlug}/diskussion`
    default:
      return `/${slugDateFormat(publishDate)}/${cleanedSlug}`
  }
}

// TODO this can move to packages/search as soon as redis is out
const prepareMetaForPublish = async ({
  repoId,
  repoMeta,
  scheduledAt,
  prepublication,
  doc,
  now = new Date(),
  context
}) => {
  const docMeta = doc.content.meta

  let publishDate = repoMeta.publishDate
    ? new Date(repoMeta.publishDate)
    : null
  let savePublishDate
  if (!publishDate) {
    publishDate = docMeta.publishDate
      ? new Date(docMeta.publishDate)
      : new Date(scheduledAt || now)
    savePublishDate = true
  }

  const path = getPath({
    ...docMeta,
    publishDate
  })

  let discussionId
  if (docMeta.template === 'discussion') {
    discussionId = await upsertDiscussion(repoMeta, {...docMeta, path}, context)
  }

  if (savePublishDate || (discussionId && discussionId !== repoMeta.discussionId)) {
    await editRepoMeta(null, {
      repoId,
      ...savePublishDate
        ? { publishDate }
        : { },
      ...discussionId
        ? { discussionId }
        : { }
    }, context)
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

  const { audioSourceMp3, audioSourceAac, audioSourceOgg } = doc.content.meta
  const audioSource = audioSourceMp3 || audioSourceAac || audioSourceOgg ? {
    mp3: audioSourceMp3,
    aac: audioSourceAac,
    ogg: audioSourceOgg
  } : null

  // hasAudio: either audioSource or audio-only-video in content
  // hasVideo: at least one non audio-only-video in content
  let hasAudio = !!audioSource
  let hasVideo = false
  visit(doc.content, 'zone', node => {
    if (node.data && node.identifier === 'EMBEDVIDEO') {
      if (node.data.forceAudio) {
        hasAudio = true
      } else {
        hasVideo = true
      }
    }
  })

  const authors = credits
    .filter(c => c.type === 'link')
    .map(a => a.children[0].value)

  const isSeriesMaster = typeof docMeta.series === 'object'
  const isSeriesEpisode = typeof docMeta.series === 'string'
  // map series episodes to the key seriesEpisodes to have consistent types
  // and not having to touch the series key
  let seriesEpisodes
  if (typeof docMeta.series === 'object') {
    seriesEpisodes = docMeta.series.episodes.map(e => {
      if (e.publishDate === '') {
        e.publishDate = null
      }
    })
  }

  // transform docMeta
  return {
    ...docMeta,
    feed: docMeta.feed || (docMeta.feed === undefined && docMeta.template === 'article'),
    repoId,
    path,
    publishDate,
    prepublication,
    scheduledAt,
    discussionId,
    credits,
    audioSource,
    authors,
    isSeriesMaster,
    isSeriesEpisode,
    seriesEpisodes,
    hasAudio,
    hasVideo
  }
}

// if the requirements for context change you need to
// adapt lib/publicationScheduler
const handleRedirection = async (
  repoId,
  newDocMeta,
  context
) => {
  const { lib: { Documents: { findPublished } } } = require('@orbiting/backend-modules-search')

  const newPath = newDocMeta.path
  const { elastic } = context

  const docs = await findPublished(elastic, repoId)

  await Promise.all(docs.map(async doc => {
    if (doc.meta.path !== newPath) {
      debug('upsertRedirection', { source: doc.meta.path, target: newPath })
      return upsertRedirection({
        source: doc.meta.path,
        target: newPath,
        resource: { repo: { id: repoId } }
      }, context)
    }
  }))
}

module.exports = {
  prepareMetaForPublish,
  handleRedirection
}
