const Promise = require('bluebird')
const { hyphenate } = require('hyphen/de-ch-1901')

const {
  lib: { resolve },
} = require('@orbiting/backend-modules-documents')

const commit = require('./Commit')
const { getPath } = require('../../lib/Document')

const getDocFromMetaLink = async (url, context) => {
  const { repoId } = resolve.getRepoId(url)
  if (!repoId) {
    return null
  }

  const latestCommit = await context.loaders.Commit.byRepoIdLatest.load(repoId)
  return (
    (latestCommit && (await commit.document(latestCommit, {}, context))) || null
  )
}

const resolveSeriesEpisodes = async (series, context) => {
  if (!series) {
    return series
  }

  const episodes = await Promise.map(series.episodes || [], async (episode) => {
    const { label, title, lead, publishDate, document } = episode

    return {
      ...episode,
      ...(label && { label: await hyphenate(label) }),
      ...(title && { title: await hyphenate(title) }),
      ...(lead && { lead: await hyphenate(lead) }),
      ...(!publishDate && { publishDate: null }),
      ...(typeof document === 'string' && {
        document: await getDocFromMetaLink(document, context),
      }),
    }
  })

  const { overview } = series

  return {
    ...series,
    ...(typeof overview === 'string' && {
      overview: await getDocFromMetaLink(overview, context),
    }),
    ...(episodes && { episodes }),
  }
}

const resolveRepoId = (field) => async (meta, args, context) => {
  // after publication: return fields resolved by documents/Document.meta
  // on series master documents this is the series info
  if (typeof meta[field] === 'object') {
    if (field === 'series') {
      // however in publikator
      // the episodes { document } need another loop
      return resolveSeriesEpisodes(meta[field], context)
    }

    return meta[field]
  }

  const doc = await getDocFromMetaLink(meta[field], context)
  // for series episodes we don't want to return the master
  // document but its meta.series info object
  if (field === 'series' && doc) {
    return resolveSeriesEpisodes(doc.content.meta.series, context)
  }

  return doc || null
}

const resolvePath = (meta) => {
  if (meta.path) {
    return meta.path
  }

  // {meta.path} is mocked if Document.meta.path is missing. It comes
  // in handy when resolving unpublished documents (e.g. via latest
  // commit).
  return getPath({
    ...meta,
    slug: `${meta.slug}---mocked`,
    publishDate: new Date(),
  })
}

module.exports = {
  format: resolveRepoId('format'),
  section: resolveRepoId('section'),
  dossier: resolveRepoId('dossier'),
  series: resolveRepoId('series'),
  path: resolvePath,
}
