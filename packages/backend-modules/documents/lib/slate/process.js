const { slateVisit: visit } = require('@orbiting/backend-modules-utils')

const processContentHashing = (content) => {
  // @TODO: might become a stub
  return Promise.resolve()
}

const processRepoImageUrlsInContent = async (content, fn) => {
  // slate content
  await visit(
    content,
    (node) => !!node?.images,
    async (node) => {
      for (const key of Object.keys(node.images)) {
        const image = node.images[key]

        if (image.url) {
          image.url = await fn(image.url)
        }
      }
    },
  )
}

const processEmbedImageUrlsInContent = async (content, fn) => {
  // @TODO: might become a stub
  return Promise.resolve()
}

const processEmbedsInContent = async (content, fn, context) => {
  // @TODO: might become a stub
  return Promise.resolve()
}

const processMembersOnlyZonesInContent = (content, user, apiKey) => {
  // @TODO: might become a stub
  return Promise.resolve()
}

const processNodeModifiersInContent = (content, user) => {
  // @TODO: might become a stub
  return Promise.resolve()
}

const processIfHasAccess = (content, user, apiKey) => {
  // @TODO: might become a stub
  return Promise.resolve()
}

module.exports = {
  processContentHashing,
  processRepoImageUrlsInContent,
  processEmbedImageUrlsInContent,
  processEmbedsInContent,
  processMembersOnlyZonesInContent,
  processNodeModifiersInContent,
  processIfHasAccess,
}
