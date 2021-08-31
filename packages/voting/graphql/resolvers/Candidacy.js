const { Roles, transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  user: (candidacy, args, { user: me }) => transformUser(candidacy.user),
  yearOfBirth: (candidacy, args, { user: me }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return
    }

    if (!candidacy.user.birthday) {
      return
    }

    return new Date(candidacy.user.birthday).getFullYear()
  },
  city: (candidacy, args, { user: me }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return
    }

    if (!candidacy.user.address.city) {
      return
    }

    return candidacy.user.address.city
  },
  credential: (candidacy, args, { user: me, pgdb }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return
    }

    if (!candidacy.credentialId) {
      return
    }

    return pgdb.public.credentials.findOne({ id: candidacy.credentialId })
  },
}
