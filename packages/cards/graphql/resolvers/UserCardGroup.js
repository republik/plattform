const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = {
  async cards (userGroup, args, { pgdb }) {
    console.log(userGroup)

    const cards = await pgdb.public.gsheets.findOneFieldOnly(
      { name: 'cards/mockUserCards' },
      'data'
    )

    return paginate(
      Object.assign({}, defaults, args),
      cards.filter(card => card.group && card.group.id === userGroup.id)
    )
  }
}
