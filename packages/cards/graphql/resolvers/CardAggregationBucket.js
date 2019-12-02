const { paginateCards } = require('../../lib/cards')

module.exports = {
  cards (bucket, args, context) {
    return paginateCards(
      bucket.cards,
      args,
      context
    )
  }
}
