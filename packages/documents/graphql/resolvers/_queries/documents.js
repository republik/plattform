const { descending } = require('d3-array')
const visit = require('unist-util-visit')
const isUUID = require('is-uuid')
const debug = require('debug')('documents')
const {
  Roles: {
    userHasRole,
    userIsInRoles
  }
} = require('@orbiting/backend-modules-auth')

const {
  getMeta
} = require('../../../lib/meta')
const {
  extractUserUrl
} = require('../../../lib/resolve')

const {
  DOCUMENTS_RESTRICT_TO_ROLES
} = process.env

module.exports = async (_, args, { user, redis, pgdb }) => {
  const ref = userHasRole(user, 'editor')
    ? 'prepublication'
    : 'publication'

  const repoIds = await redis.smembersAsync('repos:ids')
  const {
    feed,
    userId,
    dossier: dossierId,
    template,
    format: formatId,
    after,
    first,
    before,
    last,
    slug
  } = args

  return Promise.all(
    repoIds.map(repoId => {
      return redis.getAsync(`repos:${repoId}/${ref}`)
        .then(publication => {
          const json = JSON.parse(publication)
          if (!json) {
            return null
          }
          return {
            repoId,
            id: Buffer.from(`repo:${repoId}`).toString('base64'),
            ...json.doc
          }
        })
    })
  )
    .then(async docs => {
      const allDocuments = docs.filter(Boolean)
      const userIds = []
      allDocuments.forEach(doc => {
        visit(doc.content, 'link', node => {
          const info = extractUserUrl(node.url)
          if (info) {
            node.url = info.path
            if(isUUID.v4(info.id)) {
              userIds.push(info.id)
            } else {
              debug('documents found nonUUID %s in repo %s', info.id, doc.repoId)
            }
          }
        })
      })
      const usernames = userIds.length
        ? await pgdb.public.users.find(
          {
            id: userIds,
            hasPublicProfile: true,
            'username !=': null
          },
          {
            fields: ['id', 'username']
          }
        )
        : []
      allDocuments.forEach(doc => {
        // expose all documents to each document
        // for link resolving in lib/resolve
        // - including the usernames
        doc._all = allDocuments
        doc._usernames = usernames
      })

      let documents = allDocuments
      if (feed) {
        documents = documents.filter(d => (
          d.content.meta.feed ||
          (d.content.meta.feed === undefined && d.content.meta.template === 'article')
        ))
      }
      if (userId) {
        documents = documents.filter(d => {
          const userIds = (getMeta(d).credits || [])
            .filter(c => c.type === 'link')
            .map(c => c.url.split('~')[1])
            .filter(Boolean)
          return userIds.includes(userId)
        })
      }
      if (dossierId) {
        documents = documents.filter(d => {
          const dossier = getMeta(d).dossier
          return dossier && (
            dossier.id === dossierId ||
            dossier.repoId === dossierId
          )
        })
      }
      if (formatId) {
        documents = documents.filter(d => {
          const format = getMeta(d).format
          return format && (
            format.id === formatId ||
            format.repoId === formatId
          )
        })
      }
      if (slug) {
        documents = documents.filter(d => (
          d.content.meta.slug === slug
        ))
      }
      if (template) {
        documents = documents.filter(d => (
          d.content.meta.template === template
        ))
      }

      documents = documents.sort((a, b) =>
        descending(new Date(a.content.meta.publishDate), new Date(b.content.meta.publishDate))
      )

      let readNodes = true
      // we only restrict the nodes array
      // making totalCount always available
      // - querying a single document by slug is always allowed
      if (DOCUMENTS_RESTRICT_TO_ROLES && !slug) {
        const roles = DOCUMENTS_RESTRICT_TO_ROLES.split(',')
        readNodes = userIsInRoles(user, roles)
      }

      let startIndex = 0
      let endIndex = documents.length
      if (after) {
        startIndex = documents.findIndex(node => node.id === after)
      }
      if (before) {
        endIndex = documents.findIndex(node => node.id === before)
      }
      if (first !== undefined) {
        endIndex = startIndex + first
      } else if (last !== undefined) {
        startIndex = endIndex - last
      }
      const nodes = documents.slice(startIndex, endIndex)

      const end = nodes[nodes.length - 1]
      const start = nodes[0]

      return {
        totalCount: documents.length,
        nodes: readNodes
          ? nodes
          : [],
        pageInfo: {
          endCursor: readNodes
            ? end && end.id
            : undefined,
          hasNextPage: endIndex < documents.length - 1,
          hasPreviousPage: startIndex > 0,
          startCursor: readNodes
            ? start && start.id
            : undefined
        }
      }
    })
}
