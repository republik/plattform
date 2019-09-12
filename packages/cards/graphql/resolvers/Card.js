const _ = require('lodash')

const { AccessToken: { getUserByAccessToken } } = require('@orbiting/backend-modules-auth')

module.exports = {
  async user (card, { accessToken }, context) {
    const { loaders } = context
    const user = await loaders.User.byId.load(card.userId)

    if (accessToken) {
      const tokenUser = await getUserByAccessToken(accessToken, context)

      if (tokenUser && tokenUser.id === user.id) {
        return tokenUser
      }
    }

    return user
  },

  async group (card, args, { loaders }) {
    return loaders.CardGroup.byId.load(card.cardGroupId)
  },

  payload (card, args) {
    const { paths } = args
    const { meta, ...payload } = card.payload

    if (!paths || paths.length < 1) {
      return payload
    }

    return _.pick(payload, paths.map(_.toPath))
  },

  async statement (card, args, { loaders }) {
    if (!card.commentId) {
      return null
    }

    return loaders.Comment.byId.load(card.commentId)
  }
}
