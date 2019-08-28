const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = {
  async user (card, args, { loaders }) {
    return loaders.User.byId.load(card.userId)
  },

  async group (card, args, { loaders }) {
    return paginate(
      Object.assign({}, defaults, args),
      await loaders.CardGroup.byId.load(card.cardGroupId)
    )
  },

  payload (card) {
    const { meta, ...payload } = card.payload
    return payload
  }
}
