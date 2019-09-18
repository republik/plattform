const { paginateCards } = require('../../lib/cards')

module.exports = {
  async cards (user, args, context) {
    return paginateCards(
      await context.loaders.Card.byUserId.load(user.id),
      args,
      context
    )
  }
}
