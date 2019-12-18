const debug = require('debug')('publikator:cache:upsert')

const utils = require('@orbiting/backend-modules-search/lib/utils')

/**
 * Builds ElasticSearch routing object, to find documents in an {index} of a
 * certain {type}.
 *
 * @param  {String} id A repository ID
 * @return {Object}    Routing object to pass ElacsticSearch client
 */
const getPath = (id) => ({
  index: utils.getIndexAlias('repo', 'write'),
  type: 'Repo',
  id
})

const getContentString = (mdast) => {
  const contentString = mdast && utils.mdastContentToString(mdast)

  if (!contentString) {
    return
  }

  return { contentString }
}

const getContentMeta = ({ meta = false } = {}) => {
  if (!meta) {
    return
  }

  if (meta.series) {
    if (typeof meta.series === 'string') {
      meta.seriesEpisode = meta.series
    }

    if (typeof meta.series === 'object') {
      meta.seriesMaster = meta.series
      meta.seriesMaster.episodes =
        meta.seriesMaster.episodes.map(episode => {
          if (episode.publishDate === '') {
            delete episode.publishDate
          }

          return episode
        })
    }

    delete meta.series
  } else {
    delete meta.series
  }

  return { contentMeta: meta }
}

const getLatestCommit = commit => {
  if (!commit) {
    return
  }

  return {
    latestCommit: {
      id: commit.id || commit.sha,
      date: commit.date || commit.author.date,
      author: commit.author,
      message: commit.message
    }
  }
}

const getLatestPublications = publications => {
  if (!publications) {
    return
  }

  return { latestPublications: publications }
}

const getRepoMeta = meta => {
  if (!meta) {
    return
  }

  return { meta }
}

const getRepoTags = tags => {
  if (!tags) {
    return
  }

  return { tags }
}

const alterRepoTag = (tag, doc) => {
  if (!tag || !tag.name || !tag.action || !doc._source) {
    return
  }

  if (!doc._source.tags) {
    doc._source.tags = {
      nodes: []
    }
  }

  // Remove provided tag from nodes
  const nodes = doc._source.tags.nodes.filter(n => n.name !== tag.name)

  // Add tag to nodes again if action is set to be true
  if (tag.action === 'add') {
    nodes.push({ name: tag.name })
  }

  return { tags: { nodes } }
}

const upsert = async ({
  commit,
  content,
  createdAt,
  isArchived,
  id,
  meta,
  name,
  publications,
  tag,
  tags,
  updatedAt,
  refresh = true
}, {
    elastic
  }) => {
  let doc = {}

  // Only check and fetch an existing document if {tag} is required to be
  // altered.
  if (tag) {
    const hasDoc = await elastic.exists(getPath(id))

    if (hasDoc) {
      doc = await elastic.get(getPath(id))
    }
  }

  if (!updatedAt) {
    updatedAt = new Date()
  }

  const partialDoc = {
    id,
    name,
    createdAt,
    updatedAt,
    isArchived,
    ...getContentString(content),
    ...getContentMeta(content),
    ...getLatestCommit(commit),
    ...getLatestPublications(publications),
    ...getRepoMeta(meta),
    ...getRepoTags(tags),
    ...alterRepoTag(tag, doc)
  }

  debug('upsert', id)

  await elastic.update({
    ...getPath(id),
    refresh,
    version: doc._version,
    body: {
      doc_as_upsert: true,
      doc: partialDoc
    }
  })
}

module.exports = {
  upsert
}
