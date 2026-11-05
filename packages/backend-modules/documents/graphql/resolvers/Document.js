const { getMeta } = require('../../lib/meta')
const getDocuments = require('./_queries/documents')

module.exports = {
  repoId(doc, _args, _context) {
    return (
      doc.repoId ||
      Buffer.from(doc.id, 'base64')
        .toString('utf-8')
        .split('/')
        .slice(0, 2)
        .join('/')
    )
  },
  issuedForUserId(_doc, _args, context) {
    return context.user?.id || null
  },
  type(doc) {
    return doc.type || 'mdast'
  },
  content(doc) {
    return doc.content
  },
  async meta(doc) {
    return getMeta(doc)
  },
  async children(
    doc,
    { first, last, before, after, only, urlPrefix, searchString },
    context,
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
