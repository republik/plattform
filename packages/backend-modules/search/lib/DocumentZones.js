const crypto = require('crypto')
const visit = require('unist-util-visit')
const Promise = require('bluebird')
const debug = require('debug')('search:lib:DocumentZones')

const {
  stringifyNode,
} = require('@orbiting/backend-modules-documents/lib/resolve')

const { getIndexAlias } = require('./utils')
const { termEntry } = require('./schema')
const { termCriteriaBuilder } = require('./filters')

const indexType = 'DocumentZone'
const indexRef = {
  index: getIndexAlias(indexType.toLowerCase(), 'write'),
  // type: indexType,
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
  const { type, content } = elasticDoc
  const nodes = []

  if (type === 'mdast') {
    visit(content, 'zone', (node) => {
      if (shouldIndexNode(node)) {
        nodes.push(node)
      }
    })
  }

  return nodes
}

const getZoneHash = (node) =>
  crypto.createHash('md5').update(JSON.stringify(node)).digest('hex')

const getZoneId = (repoId, versionName, contentHash) =>
  Buffer.from(`${repoId}/${versionName}/${contentHash}`).toString('base64')

const getElasticDoc = async (
  repoId,
  commitId,
  versionName,
  state,
  date,
  type,
  node,
) => {
  const contentHash = getZoneHash(node)
  const id = getZoneId(repoId, versionName, contentHash)

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
    versionName,
    contentHash,
    identifier,
    type,
    node,
    data: node?.data || {},
    text: (stringifyNode(node)).trim() || '',
  }
}

const switchState = async function (
  elastic,
  state,
  repoId,
  commitId,
  versionName,
  immediate,
) {
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
    conflicts: 'proceed',
    body: {
      query: {
        bool: {
          must: [{ term: { repoId } }],
          should: queries,
          must_not: [{ term: { versionName } }],
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

  if (!immediate) {
    await elastic.updateByQuery({
      ...indexRef,
      refresh: true,
      conflicts: 'proceed',
      body: {
        query: {
          bool: {
            must: [{ term: { repoId } }, { term: { versionName } }],
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
}

const createPublish = (elastic, elasticDoc) => {
  const {
    commitId,
    versionName,
    meta: { repoId, publishDate },
  } = elasticDoc

  const actions = []

  return {
    insert: async (desiredState) => {
      const inserts = await Promise.map(findNodes(elasticDoc), async (node) => {
        const documentZoneElasticDoc = await getElasticDoc(
          repoId,
          commitId,
          versionName,
          desiredState,
          publishDate,
          elasticDoc.type,
          node,
        )

        return elastic.index({
          ...indexRef,
          id: documentZoneElasticDoc.id,
          body: documentZoneElasticDoc,
        })
      })

      actions.push('insert')

      return inserts.length
    },
    after: async (desiredState) => {
      await switchState(
        elastic,
        desiredState,
        repoId,
        commitId,
        versionName,
        actions.includes('insert'),
      )
      actions.push('after')
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
    conflicts: 'proceed',
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
