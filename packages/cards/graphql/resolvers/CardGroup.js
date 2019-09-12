const { paginateCards } = require('../../lib/cards')

module.exports = {
  async cards (cardGroup, args, { loaders }) {
    return paginateCards(args, await loaders.Card.byCardGroupId.load(cardGroup.id))
  },

  async discussion (cardGroup, args, { loaders }) {
    if (!cardGroup.discussionId) {
      return null
    }

    return loaders.Discussion.byId.load(cardGroup.discussionId)
  }
}
