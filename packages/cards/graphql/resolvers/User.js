const { paginateCards } = require('../../lib/cards')

module.exports = {
  async cards (user, args, { loaders }) {
    return paginateCards(args, await loaders.Card.byUserId.load(user.id))
  }
}
