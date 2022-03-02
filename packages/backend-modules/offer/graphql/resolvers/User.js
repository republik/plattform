const { Roles } = require('@orbiting/backend-modules-auth')

const { getOffer } = require('../../lib/offer')

module.exports = {
  offer: (user, args, context) => {
    const { user: me } = context

    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return getOffer(context, user)
    }
  },
}
