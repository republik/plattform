const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  async user (userCard, args, { pgdb }) {
    if (!userCard.user) {
      return null
    }

    const user = await pgdb.public.users.findOne({ id: userCard.user.id })

    return transformUser(user)
  },

  async group (userCard, args, { pgdb }) {
    if (!userCard.group) {
      return null
    }

    const groups = await pgdb.public.gsheets.findOneFieldOnly(
      { name: 'cards/mockUserCardGroups' },
      'data'
    )

    const group = groups.find(group => group.id === userCard.group.id)

    return group
  }
}
