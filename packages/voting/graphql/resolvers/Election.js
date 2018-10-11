const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  candidacies: async (election, args, { user: me }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return []
    }

    if (election.candidacies) {
      return election.candidacies
    }

    return []
  }
}
