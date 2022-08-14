const checkEnv = require('check-env')
const {
  slateVisit: visit,
  slateToString: toString,
} = require('@orbiting/backend-modules-utils')
const { v4: isUuid } = require('is-uuid')

const { hasFullDocumentAccess } = require('../restrictions')
const {
  createResolver,
  createUrlReplacer,
  getRepoId,
  extractUserUrl,
} = require('../common/resolve')

checkEnv(['FRONTEND_BASE_URL'])

const { DOCUMENTS_LINKS_RESTRICTED } = process.env

const contentUrlResolver = async (
  doc,
  _all = [],
  _usernames = [],
  errors,
  urlPrefix,
  searchString,
  user,
) => {
  const docResolver = createResolver(_all, _usernames, errors)
  const externalBaseUrl = docResolver(doc.meta?.format)?.meta?.externalBaseUrl

  const urlReplacer = createUrlReplacer(
    _all,
    _usernames,
    errors,
    urlPrefix,
    searchString,
    externalBaseUrl,
  )

  const stripDocLinks =
    DOCUMENTS_LINKS_RESTRICTED &&
    DOCUMENTS_LINKS_RESTRICTED.split(',').includes(doc.meta?.path) &&
    // user is undefined during publish -> no stripping
    // null during document delivery -> strip unless authorized
    user !== undefined &&
    !hasFullDocumentAccess(user, doc._apiKey)

  await visit(
    doc.content,
    (node) => node?.type === 'link',
    (node) => {
      node.href = urlReplacer(node.href, stripDocLinks)
    },
  )
}

const metaUrlResolver = (
  meta,
  _all,
  _usernames,
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
    (node) => node?.type === 'link',
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

  return {
    repos: repos.filter(Boolean),
    users: users.filter(Boolean),
  }
}

const stringifyNode = async (node) => {
  if (!node?.children) {
    return ''
  }

  return toString(node.children)
}

module.exports = {
  contentUrlResolver,
  metaUrlResolver,
  extractIdsFromNode,
  stringifyNode,
}
