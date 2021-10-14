const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

const { getEmbedData } = require('../../../lib/fetchAndStore')

module.exports = async (_, args, { user, t }) => {
  ensureUserHasRole(user, 'editor')

  const { id, embedType } = args
  return {
    ...(await getEmbedData(args, t)),
    __typename: embedType,
    mediaId: `${embedType}-${id}`,
  }
}
