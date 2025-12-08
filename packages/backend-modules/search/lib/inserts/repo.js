const visit = require('unist-util-visit')
const Promise = require('bluebird')

const {
  stringifyNode,
} = require('@orbiting/backend-modules-documents/lib/resolve')
const { parse: mdastParse } = require('@republik/remark-preset')

const bulk = require('../indexPgTable')

function getCommit(restCommit) {
  const { id, message, createdAt } = restCommit
  return { id, message, createdAt }
}

async function toStrings(type, nodes) {
  const keys = Object.keys(nodes)

  const nodeToString = async (key) => {
    const node = nodes[key]
    const string = stringifyNode(node)
    return { [key]: string }
  }

  const toObject = (strings, resolvedNode) => {
    return {
      ...strings,
      ...resolvedNode,
    }
  }

  return Promise.map(keys, nodeToString).reduce(toObject)
}

async function getCommitStrings(type, content) {
  if (!content) {
    return {}
  }

  const nodes = {
    text: content,
  }

  // @TODO: slate needs a sibling to this.
  if (type === 'mdast') {
    visit(content, 'zone', (node) => {
      if (node.identifier === 'TITLE') {
        nodes.title = {
          children: node.children.filter(
            (n) => n.type === 'heading' && n.depth === 1,
          ),
        }

        nodes.subject = {
          children: node.children.filter(
            (n) => n.type === 'heading' && n.depth === 2,
          ),
        }

        nodes.lead = {
          children: [
            node.children.filter((n) => n.type === 'paragraph')[0],
          ].filter(Boolean),
        }

        nodes.credits = {
          children: [
            node.children.filter((n) => n.type === 'paragraph')[1],
          ].filter(Boolean),
        }
      }
    })
  }

  return { strings: await toStrings(type, nodes) }
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
        const row = await pgdb.publikator.commits.findOne(
          { repoId },
          { orderBy: { createdAt: 'desc' }, limit: 1 },
        )

        if (!row) {
          return
        }

        return {
          ...row,
          content: row.content || mdastParse(row.content__markdown),
          type: row.type || 'mdast',
        }
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
