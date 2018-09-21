const debug = require('debug')('publikator:cache:upsert')
const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const utils = require('@orbiting/backend-modules-search/lib/utils')

const client = elasticsearch.client()

const getPath = (id) => ({
  index: utils.getIndexAlias('repo', 'write'),
  type: 'Repo',
  id
})

const getContentString = (mdast) => {
  const contentString = mdast && utils.mdastPlain(
    utils.mdastFilter(
      mdast,
      node => node.type === 'code'
    )
  )

  if (!contentString) {
    return
  }

  return {
    contentString
  }
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
    }

    delete meta.series
  } else {
    delete meta.series
  }

  return {
    contentMeta: meta
  }
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

  return {
    latestPublications: publications
  }
}

const getRepoMeta = meta => {
  if (!meta) {
    return
  }

  return {
    meta
  }
}

const getRepoTags = tags => {
  if (!tags) {
    return
  }

  return { tags }
}

const alterRepoTag = (tag, doc) => {
  if (!tag || !tag.name || !tag.action) {
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

  return {
    tags: { nodes }
  }
}

const upsert = async ({
  commit,
  content,
  id,
  meta,
  publications,
  publication,
  tags,
  tag
}) => {
  let doc = {}

  const hasDoc = await client.exists(getPath(id))

  if (hasDoc) {
    doc = await client.get(getPath(id))
  }

  const partials = {
    id,
    ...getContentString(content),
    ...getContentMeta(content),
    ...getLatestCommit(commit),
    ...getLatestPublications(publications),
    ...getRepoMeta(meta),
    ...getRepoTags(tags),
    ...alterRepoTag(tag, doc)
  }

  debug('upsert', id)

  await client.update({
    ...getPath(id),
    version: doc._version,
    body: {
      doc_as_upsert: true,
      doc: partials
    }
  })
}

module.exports = {
  upsert
}
