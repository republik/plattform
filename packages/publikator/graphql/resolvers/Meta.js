const {
  lib: { resolve },
} = require('@orbiting/backend-modules-documents')

const repo = require('./Repo')
const commit = require('./Commit')

const getDocFromMetaLink = async (url, context) => {
  const { t } = context

  const { repoId } = resolve.getRepoId(url)
  if (!repoId) {
    return null
  }

  const latestCommit = await repo
    .latestCommit({ id: repoId }, null, context)
    .catch((e) => {
      if (e.message !== t('api/github/unavailable')) {
        throw e
      }
    })
  const doc = latestCommit && (await commit.document(latestCommit, {}, context))
  return doc || null
}

const resolveSeriesEpisodes = async (series, context) => {
  if (
    series.episodes?.find((episode) => typeof episode.document === 'string')
  ) {
    // copy object, prevent modifying content.meta
    const episodes = [].concat(series.episodes).map((episode) => ({
      ...episode,
    }))
    for (const episode of episodes) {
      // ensure not already resolved by previous run
      if (typeof episode.document === 'string') {
        episode.document = await getDocFromMetaLink(episode.document, context)
      }
    }
    return {
      ...series,
      episodes,
    }
  }
  return series
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

module.exports = {
  format: resolveRepoId('format'),
  section: resolveRepoId('section'),
  dossier: resolveRepoId('dossier'),
  series: resolveRepoId('series'),
}
