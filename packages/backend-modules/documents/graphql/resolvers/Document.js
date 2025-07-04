const Promise = require('bluebird')

const { getMeta } = require('../../lib/meta')
const {
  processContentHashing,
  processMembersOnlyZonesInContent,
  processRepoImageUrlsInContent,
  processRepoImageUrlsInMeta,
  processEmbedImageUrlsInContent,
  processNodeModifiersInContent,
  processIfHasAccess,
} = require('../../lib/process')
const {
  contentUrlResolver,
  contentUserResolver,
  metaUrlResolver,
  extractIdsFromNode,
} = require('../../lib/resolve')

const getDocuments = require('./_queries/documents')

const {
  lib: {
    webp: { addFormatAuto },
  },
} = require('@orbiting/backend-modules-assets')

const {
  resolveEntities,
} = require('@orbiting/backend-modules-search/lib/Documents')

const {
  processMeta: processSyntheticReadAloudInMeta,
} = require('@orbiting/backend-modules-publikator/lib/Derivative/SyntheticReadAloud')

module.exports = {
  repoId(doc, args, context) {
    return (
      doc.repoId ||
      Buffer.from(doc.id, 'base64')
        .toString('utf-8')
        .split('/')
        .slice(0, 2)
        .join('/')
    )
  },
  issuedForUserId(doc, args, context) {
    return context.user?.id || null
  },
  type(doc) {
    return doc.type || 'mdast'
  },
  async content(doc, { urlPrefix, searchString }, context, info) {
    // we only do auto slugging when in a published documents context
    // - this is easiest detectable by _all being present from documents resolver
    // - alt check info.path for documents / document being the root
    //   https://gist.github.com/tpreusse/f79833a023706520da53647f9c61c7f6
    if (doc._all || doc._users) {
      processContentHashing(doc.type, doc.content)

      await contentUrlResolver(
        doc,
        doc._all,
        doc._users,
        undefined,
        urlPrefix, // https://www.republik.ch bei Newslettern?
        searchString,
        context.user || null,
      )

      await Promise.all([
        contentUserResolver(doc.content, doc._users),
        processRepoImageUrlsInContent(doc.content, addFormatAuto),
        processEmbedImageUrlsInContent(doc.content, addFormatAuto),
      ])

      processMembersOnlyZonesInContent(doc.content, context.user, doc._apiKey)
      processNodeModifiersInContent(doc.content, context.user)
      if (doc.meta.template !== 'article') {
        processIfHasAccess(doc.content, context.user, doc._apiKey)
      }
    }
    return doc.content
  },
  async meta(doc, { urlPrefix, searchString }, context, info) {
    const meta = await getMeta(doc)
    if (doc._all || doc._users) {
      metaUrlResolver(
        doc.type,
        meta,
        doc._all,
        doc._users,
        undefined,
        urlPrefix,
        searchString,
        context.user || null,
        doc._apiKey,
      )

      await processRepoImageUrlsInMeta(doc.content, addFormatAuto)
    }

    return processSyntheticReadAloudInMeta(meta, doc, context)
  },
  async children(
    doc,
    { first, last, before, after, only, urlPrefix, searchString },
    context,
    info,
  ) {
    if (!doc || !doc.content || !doc.content.children) {
      return {
        pageInfo: {
          endCursor: null,
          startCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: 0,
        nodes: [],
      }
    }

    const children = (doc.content.children.length && doc.content.children) || []
    const totalCount = children.length
    const firstIndex = 0
    const lastIndex = totalCount - 1
    const beginOffset = after
      ? children.findIndex((v) => v.data.id === after) + 1
      : firstIndex
    // slice extracts up to but not including end
    const endOffset = before
      ? children.findIndex((v) => v.data.id === before)
      : lastIndex + 1

    const isLast = last && !first
    const childrenSubset = only
      ? children.filter((child) => child.data.id === only)
      : children.slice(beginOffset, endOffset)
    const nodes = isLast
      ? childrenSubset.slice(-1 * last)
      : childrenSubset.slice(0, first)
    const startCursor = nodes.length && nodes[0].data.id
    const endCursor = nodes.length && nodes.slice(-1)[0].data.id

    const hasNextPage =
      !!endCursor &&
      children.some((v, i) => v.data.id === endCursor && i < lastIndex)
    const hasPreviousPage =
      !!startCursor &&
      children.some((v, i) => v.data.id === startCursor && i > firstIndex)

    if (doc._all) {
      // add content hash before mutating children by resolving
      processContentHashing(doc.type, { children: nodes })

      const idsFromNodes = await Promise.map(nodes, async (node) => {
        await Promise.all([
          contentUserResolver(node, doc._users),
          processRepoImageUrlsInContent(node, addFormatAuto),
          processEmbedImageUrlsInContent(node, addFormatAuto),
        ])

        processMembersOnlyZonesInContent(node, context.user, doc._apiKey)
        processNodeModifiersInContent(node, context.user)
        if (doc.meta.template !== 'article') {
          processIfHasAccess(node, context.user, doc._apiKey)
        }

        return extractIdsFromNode(node, doc.meta.repoId)
      })
      const { docs, users } = await resolveEntities({
        context,
        userIds: idsFromNodes.reduce(
          (userIds, idsFromNode) => userIds.concat(idsFromNode.users),
          [],
        ),
        repoIds: idsFromNodes.reduce(
          (repoIds, idsFromNode) => repoIds.concat(idsFromNode.repos),
          [],
        ),
      })
      doc._all = doc._all.concat(docs)
      doc._users = doc._users.concat(users)

      await contentUrlResolver(
        doc,
        doc._all,
        doc._users,
        undefined,
        urlPrefix,
        searchString,
        context.user || null,
      )
    }

    return {
      pageInfo: {
        startCursor,
        endCursor,
        hasNextPage,
        hasPreviousPage,
      },
      totalCount,
      nodes,
    }
  },
  linkedDocuments(doc, args, context, info) {
    const hasDossierRepoId = doc.meta.template === 'dossier' && doc.meta.repoId
    const hasFormatRepoId = doc.meta.template === 'format' && doc.meta.repoId
    const hasSectionRepoId = doc.meta.template === 'section' && doc.meta.repoId

    if (!hasDossierRepoId && !hasFormatRepoId && !hasSectionRepoId) {
      return {
        pageInfo: {
          endCursor: null,
          startCursor: null,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: 0,
        nodes: [],
      }
    }

    if (hasDossierRepoId) {
      args.dossier = doc.id
    }

    if (hasFormatRepoId) {
      args.format = doc.id
    }

    if (hasSectionRepoId) {
      args.section = doc.id
      args.unrestricted = true
    }

    return getDocuments(doc, args, context, info)
  },
}
