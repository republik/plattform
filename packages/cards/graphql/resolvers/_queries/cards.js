const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = async (_, args, { pgdb }) => {
  const cards = await pgdb.public.gsheets.findOneFieldOnly(
    { name: 'cards/mockCards' },
    'data'
  )

  return paginate(
    Object.assign({}, defaults, args),
    cards
  )
}
