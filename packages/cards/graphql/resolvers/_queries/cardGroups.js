const { paginate } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

module.exports = async (_, args, { pgdb }) => {
  return paginate(
    Object.assign({}, defaults, args),
    await pgdb.public.cardGroups.findAll()
  )
}
