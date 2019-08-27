const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  async user (card, args, { pgdb }) {
    if (!card.user) {
      return null
    }

    const user = await pgdb.public.users.findOne({ id: card.user.id })

    return transformUser(user)
  },

  async group (card, args, { pgdb }) {
    if (!card.group) {
      return null
    }

    const groups = await pgdb.public.gsheets.findOneFieldOnly(
      { name: 'cards/mockCardGroups' },
      'data'
    )

    const group = groups.find(group => group.id === card.group.id)

    return group
  }
}
