const crypto = require('crypto')
const Promise = require('bluebird')
const { contentUrlResolver, metaUrlResolver } = require('../../lib/resolve')
const {
  processMembersOnlyZonesInContent,
  processRepoImageUrlsInContent,
  processRepoImageUrlsInMeta,
  processEmbedImageUrlsInContent,
  processNodeModifiersInContent,
} = require('../../lib/process')
const { getMeta } = require('../../lib/meta')

const getDocuments = require('./_queries/documents')

const {
  lib: {
    webp: { addFormatAuto },
  },
} = require('@orbiting/backend-modules-assets')

const {
  extractIdsFromNode,
  loadLinkedMetaData,
} = require('@orbiting/backend-modules-search/lib/Documents')

const addTeaserContentHash = (nodes) => {
  nodes.forEach((node) => {
    if (
      (node.identifier === 'TEASERGROUP' || node.identifier === 'TEASER') &&
      node.data &&
      !node.data.contentHash // already hashed
    ) {
      node.data.contentHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(node))
        .digest('hex')
    }
  })
}

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
  async content(doc, { urlPrefix, searchString }, context, info) {
    // we only do auto slugging when in a published documents context
    // - this is easiest detectable by _all being present from documents resolver
    // - alt check info.path for documents / document being the root
    //   https://gist.github.com/tpreusse/f79833a023706520da53647f9c61c7f6
    if (doc._all) {
      // add content hash before mutating children by resolving
      addTeaserContentHash(doc.content.children || [])

      contentUrlResolver(
        doc,
        doc._all,
        doc._usernames,
        undefined,
        urlPrefix,
        searchString,
        context.user || null,
      )

      await Promise.all([
        processRepoImageUrlsInContent(doc.content, addFormatAuto),
        processEmbedImageUrlsInContent(doc.content, addFormatAuto),
      ])

      processMembersOnlyZonesInContent(doc.content, context.user)
      processNodeModifiersInContent(doc.content, context.user)
    }
    return doc.content
  },
  async meta(doc, { urlPrefix, searchString }, context, info) {
    const meta = getMeta(doc)
    if (doc._all) {
      metaUrlResolver(
        meta,
        doc._all,
        doc._usernames,
        undefined,
        urlPrefix,
        searchString,
        context.user || null,
      )

      await processRepoImageUrlsInMeta(doc.content, addFormatAuto)
    }
    return meta
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
      addTeaserContentHash(nodes)

      const idsFromNodes = await Promise.map(nodes, async (node) => {
        await Promise.all([
          processRepoImageUrlsInContent(node, addFormatAuto),
          processEmbedImageUrlsInContent(node, addFormatAuto),
        ])

        processMembersOnlyZonesInContent(node, context.user)
        processNodeModifiersInContent(node, context.user)

        return extractIdsFromNode(node, doc.meta.repoId)
      })
      const { docs, usernames } = await loadLinkedMetaData({
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
      doc._usernames = doc._usernames.concat(usernames)

      contentUrlResolver(
        doc,
        doc._all,
        doc._usernames,
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
