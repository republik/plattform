const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = async (_, args, { pgdb }) => {
  const groups = await pgdb.public.gsheets.findOneFieldOnly(
    { name: 'cards/mockUserCardGroups' },
    'data'
  )

  return paginate(
    Object.assign({}, defaults, args),
    groups
  )
}
