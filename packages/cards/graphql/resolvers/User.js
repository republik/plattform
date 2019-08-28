const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = {
  async cards (user, args, { loaders }) {
    return paginate(
      Object.assign({}, defaults, args),
      await loaders.Card.byUserId.load(user.id)
    )
  }
}
