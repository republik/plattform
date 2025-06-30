const checkEnv = require('check-env')
const { v4: isUuid } = require('is-uuid')

const {
  slateVisit: visit,
  slateToString: toString,
} = require('@orbiting/backend-modules-utils')
const {
  get: getPortraitUrl,
} = require('@orbiting/backend-modules-republik/lib/portrait')

const { hasFullDocumentAccess } = require('../restrictions')
const {
  createUrlReplacer,
  getRepoId,
  extractUserUrl,
  shouldStripDocLinks,
} = require('../common/resolve')

checkEnv(['FRONTEND_BASE_URL'])

const contentUrlResolver = async (
  doc,
  _all = [],
  _users = [],
  errors,
  urlPrefix,
  searchString,
  user,
) => {
  const urlReplacer = createUrlReplacer(
    _all,
    _users,
    errors,
    urlPrefix,
    searchString,
  )

  const stripDocLinks = shouldStripDocLinks(user, doc)

  await visit(
    doc.content,
    (node) =>
      ['link', 'articlePreview', 'articlePreviewFormat'].includes(node?.type),
    (node) => {
      node.href = urlReplacer(node.href, stripDocLinks)
    },
  )

  // strip memos
  await visit(
    doc.content,
    (node) => node?.children?.some((child) => child?.type === 'memo'),
    (node) => {
      node.children = node.children.reduce(
        (children, currentChild) =>
          children.concat(
            currentChild?.type === 'memo'
              ? currentChild?.children
              : currentChild,
          ),
        [],
      )
    },
  )
}

const contentUserResolver = async (content, _users = []) => {
  // portrait (re)size
  const properties = { width: 100, height: 100 }

  await visit(
    content,
    (node) => node?.type === 'flyerAuthor',
    (node) => {
      const { authorId } = node
      delete node.authorId

      const user = _users.find(({ id }) => id === authorId)
      if (user) {
        node.resolvedAuthor = {
          name: user.name,
          portrait: getPortraitUrl(user, { properties }),
          slug: user.slug,
          status: 'exists',
        }
      } else {
        // If user can't be retrieved, return name stored in tree,
        // but drop other props.
        node.resolvedAuthor = {
          name: node.resolvedAuthor.name,
          status: 'missing',
        }
      }
    },
  )
}

const metaUrlResolver = (
  meta,
  _all,
  _users,
  errors,
  urlPrefix,
  searchString,
  user,
  apiKey,
) => {
  meta.series?.episodes?.forEach((episode, index) => {
    if (
      index <= 1 ||
      !episode.document?.meta?.path ||
      episode.document.meta.path === meta.path ||
      user === undefined ||
      hasFullDocumentAccess(user, apiKey)
    ) {
      return
    }

    episode.document = undefined
  })

  if (user === undefined || !hasFullDocumentAccess(user, apiKey)) {
    meta.recommendations = null
  }
}

const extractIdsFromNode = async (node, contextRepoId) => {
  const repos = []
  const users = []

  await visit(
    node,
    (node) => node?.type === 'link' || node?.type === 'articlePreview',
    (node) => {
      const { href } = node

      const info = extractUserUrl(href)
      if (isUuid(info?.id)) {
        users.push(info.id)
      }

      const { repoId } = getRepoId(href, 'autoSlug')
      if (repoId) {
        repos.push(repoId)
      }
    },
  )

  await visit(
    node,
    (node) => node?.type === 'flyerAuthor',
    (node) => {
      const { authorId } = node

      if (isUuid(authorId)) {
        users.push(authorId)
      }
    },
  )

  return {
    repos: repos.filter(Boolean),
    users: users.filter(Boolean),
  }
}

const stringifyNode = async (node) => {
  if (!node.children) {
    return ''
  }

  return toString(node)
    .replace(/\u00AD/g, '') // 0x00AD = Soft Hyphen (SHY)
    .trim()
}

module.exports = {
  contentUrlResolver,
  contentUserResolver,
  metaUrlResolver,
  extractIdsFromNode,
  stringifyNode,
}
