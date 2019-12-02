const { paginateCards } = require('../../lib/cards')

module.exports = {
  async cards (cardGroup, args, context) {
    return paginateCards(
      await context.loaders.Card.byCardGroupId.load(cardGroup.id),
      args,
      context
    )
  },

  async discussion (cardGroup, args, { loaders }) {
    if (!cardGroup.discussionId) {
      return null
    }

    return loaders.Discussion.byId.load(cardGroup.discussionId)
  }
}
