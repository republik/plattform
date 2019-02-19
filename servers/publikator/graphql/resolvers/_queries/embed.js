const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { getTweetById } = require('../../../lib/embeds/twitter')
const { getYoutubeVideoById } = require('../../../lib/embeds/youtube')
const { getVimeoVideoById } = require('../../../lib/embeds/vimeo')
const { getDocumentCloudDocById } = require('../../../lib/embeds/documentcloud')

const getEmbedData = ({ id, embedType }, t) => {
  switch (embedType) {
    case 'TwitterEmbed':
      return getTweetById(id, t)
    case 'YoutubeEmbed':
      return getYoutubeVideoById(id)
    case 'VimeoEmbed':
      return getVimeoVideoById(id)
    case 'DocumentCloudEmbed':
      return getDocumentCloudDocById(id)
    default:
      throw new Error(`embedType ${embedType} unknown.`)
  }
}

module.exports = async (_, args, { user, t }) => {
  ensureUserHasRole(user, 'editor')

  const { id, embedType } = args
  return {
    ...await getEmbedData(args, t),
    __typename: embedType,
    mediaId: `${embedType}-${id}`
  }
}
