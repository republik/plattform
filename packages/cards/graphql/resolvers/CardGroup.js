const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = {
  async cards (cardGroup, args, { pgdb }) {
    const cards = await pgdb.public.gsheets.findOneFieldOnly(
      { name: 'cards/mockCards' },
      'data'
    )

    return paginate(
      Object.assign({}, defaults, args),
      cards.filter(card => card.group && card.group.id === cardGroup.id)
    )
  }
}
