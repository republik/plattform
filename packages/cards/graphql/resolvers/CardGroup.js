const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = {
  async cards (cardGroup, args, { loaders }) {
    return paginate(
      Object.assign({}, defaults, args),
      await loaders.Card.byCardGroupId.load(cardGroup.id)
    )
  },

  async discussion (cardGroup, args, { loaders }) {
    if (!cardGroup.discussionId) {
      return null
    }

    return loaders.Discussion.byId.load(cardGroup.discussionId)
  }
}
