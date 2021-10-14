const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const { getEmbedData, applyProxyUrls } = require('../../../lib/fetchAndStore')

module.exports = async (_, args, { user, t }) => {
  ensureUserHasRole(user, 'editor')

  const { id, embedType } = args
  const embed = await getEmbedData(args, t)

  return {
    ...applyProxyUrls(embed, embedType),
    __typename: embedType,
    mediaId: `${embedType}-${id}`,
  }
}
