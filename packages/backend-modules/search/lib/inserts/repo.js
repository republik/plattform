const visit = require('unist-util-visit')

const {
  stringifyNode,
} = require('@orbiting/backend-modules-documents/lib/resolve')
const { mdastToString } = require('@orbiting/backend-modules-utils')

const bulk = require('../indexPgTable')

function getCommit(restCommit) {
  const { id, message, createdAt } = restCommit
  return { id, message, createdAt }
}

async function getCommitStrings(type, content) {
  if (!content) {
    return {}
  }

  const strings = {}

  const text = await stringifyNode(type, content)
  text && Object.assign(strings, { text })

  // @TODO: make this work, slate needs a sibling to this.
  if (type === 'mdast') {
    visit(content, 'zone', (node) => {
      if (node.identifier === 'TITLE') {
        const title = mdastToString({
          children: node.children.filter(
            (n) => n.type === 'heading' && n.depth === 1,
          ),
        }).trim()

        const subject = mdastToString({
          children: node.children.filter(
            (n) => n.type === 'heading' && n.depth === 2,
          ),
        }).trim()

        const lead = mdastToString({
          children: [
            node.children.filter((n) => n.type === 'paragraph')[0],
          ].filter(Boolean),
        }).trim()

        const credits = mdastToString({
          children: [
            node.children.filter((n) => n.type === 'paragraph')[1],
          ].filter(Boolean),
        }).trim()

        Object.assign(strings, {
          title,
          subject,
          lead,
          credits,
        })
      }
    })
  }

  return { strings }
}

function getCommitMeta(meta) {
  const { series, ...restMeta } = meta

  const seriesMeta = {}

  if (series) {
    if (typeof series === 'string') {
      const seriesEpisode = series
      Object.assign(seriesMeta, { seriesEpisode })
    }

    if (typeof meta.series === 'object') {
      const seriesMaster = {
        ...meta.series,
        episodes: meta.series.episodes.map((episode) => {
          const { publishDate, ...restEpisode } = episode

          return {
            ...restEpisode,
            ...(publishDate && { publishDate }),
          }
        }),
      }

      Object.assign(seriesMeta, { seriesMaster })
    }

    return {
      meta: {
        ...restMeta,
        ...seriesMeta,
      },
    }
  }

  return { meta: restMeta }
}

async function transform(row) {
  const { type, content, meta, ...restCommit } =
    await this.payload.getLatestCommit(row.id)

  return {
    ...row,
    commit: {
      ...getCommit(restCommit),
      ...(await getCommitStrings(type, content)),
      ...getCommitMeta(meta),
    },
  }
}

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.publikator.repos,
    payload: {
      getLatestCommit: async function (repoId) {
        return pgdb.publikator.commits.findOne(
          { repoId },
          { orderBy: { createdAt: 'desc' }, limit: 1 },
        )
      },
    },
    transform,
  }
}

module.exports = {
  before: () => {},
  insert: async ({ resource, ...rest }) => {
    resource = {
      ...(await getDefaultResource({ resource, ...rest })),
      ...resource,
    }

    return bulk.index({ resource, ...rest })
  },
  after: () => {},
  final: () => {},
}
