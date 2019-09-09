module.exports = {
  async user (card, args, { loaders }) {
    return loaders.User.byId.load(card.userId)
  },

  async group (card, args, { loaders }) {
    return loaders.CardGroup.byId.load(card.cardGroupId)
  },

  payload (card) {
    const { meta, ...payload } = card.payload
    return payload
  }
}
