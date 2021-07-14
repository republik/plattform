const crypto = require('crypto')
const visit = require('unist-util-visit')
const Promise = require('bluebird')
const debug = require('debug')('search:lib:DocumentZones')

const { mdastToString } = require('@orbiting/backend-modules-utils')

const { getIndexAlias, mdastFilter } = require('./utils')
const { termEntry } = require('./schema')
const { termCriteriaBuilder } = require('./filters')

const indexType = 'DocumentZone'
const indexRef = {
  index: getIndexAlias(indexType.toLowerCase(), 'write'),
  type: indexType,
}

const schema = {
  // special value to indicate this schemas index type
  __type: indexType,
  id: { criteria: termCriteriaBuilder('_id') },
  type: termEntry('__type'),
  documentZoneIdentifier: termEntry('identifier'),
  documentZoneDataType: termEntry('data.type'),
}

const shouldIndexNode = (node) =>
  node.type === 'zone' && ['CHART'].includes(node.identifier)

const findNodes = (elasticDoc) => {
  const nodes = []

  visit(elasticDoc.content, 'zone', (node) => {
    if (shouldIndexNode(node)) {
      nodes.push(node)
    }
  })

  return nodes
}

const getZoneHash = (node) =>
  crypto.createHash('md5').update(JSON.stringify(node)).digest('hex')

const getZoneId = (repoId, commitId, hash) =>
  Buffer.from(`${repoId}/${commitId}/${hash}`).toString('base64')

const getElasticDoc = (repoId, commitId, documentId, state, date, node) => {
  const hash = getZoneHash(node)
  const id = getZoneId(repoId, commitId, hash)

  const { identifier } = node

  return {
    __type: indexType,
    __state: {
      published: !!state?.published,
      prepublished: !!state?.prepublished,
    },
    __sort: { date },
    id,
    repoId,
    commitId,
    documentId,
    hash,
    identifier,
    node,
    data: node?.data || {},
    text:
      mdastToString(mdastFilter(node, (n) => n.type === 'code')).trim() || '',
  }
}

const switchState = async function (elastic, state, repoId, commitId) {
  debug('switchState', { state, repoId, commitId })
  const queries = []
  const painless = []

  if (state.published === true || state.published === false) {
    queries.push({ term: { '__state.published': state.published } })
    painless.push('ctx._source.__state.published = params.state.published')
  }

  if (state.prepublished === true || state.prepublished === false) {
    queries.push({ term: { '__state.prepublished': state.prepublished } })
    painless.push(
      'ctx._source.__state.prepublished = params.state.prepublished',
    )
  }

  const source = painless.join(';')

  await elastic.updateByQuery({
    ...indexRef,
    refresh: true,
    body: {
      query: {
        bool: {
          must: [{ term: { repoId } }],
          should: queries,
          must_not: [{ term: { commitId } }],
        },
      },
      script: {
        lang: 'painless',
        source,
        params: {
          state: {
            published: !state.published,
            prepublished: !state.prepublished,
          },
        },
      },
    },
  })

  await elastic.updateByQuery({
    ...indexRef,
    refresh: true,
    body: {
      query: {
        bool: {
          must: [{ term: { repoId } }, { term: { commitId } }],
        },
      },
      script: {
        lang: 'painless',
        source,
        params: {
          state: {
            published: !!state.published,
            prepublished: !!state.prepublished,
          },
        },
      },
    },
  })
}

const createPublish = (elastic, elasticDoc) => {
  const {
    id: documentId,
    commitId,
    meta: { repoId, publishDate },
  } = elasticDoc

  return {
    insert: async (desiredState) => {
      const inserts = await Promise.map(findNodes(elasticDoc), async (node) => {
        const documentZoneElasticDoc = getElasticDoc(
          repoId,
          commitId,
          documentId,
          desiredState,
          publishDate,
          node,
        )

        return elastic.index({
          ...indexRef,
          id: documentZoneElasticDoc.id,
          body: documentZoneElasticDoc,
        })
      })

      return inserts.length
    },
    after: async (desiredState) => {
      await switchState(elastic, desiredState, repoId, commitId)
    },
  }
}

const unpublish = async (elastic, repoId) => {
  const painless = [
    'ctx._source.__state.published = false',
    'ctx._source.__state.prepublished = false',
  ]

  await elastic.updateByQuery({
    ...indexRef,
    refresh: true,
    body: {
      query: {
        bool: {
          must: [{ term: { repoId } }],
        },
      },
      script: {
        lang: 'painless',
        source: painless.join(';'),
      },
    },
  })
}

module.exports = {
  schema,
  createPublish,
  unpublish,
}
