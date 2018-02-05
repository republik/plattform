const { Roles } = require('@orbiting/backend-modules-auth')
const documents = require('./_queries/documents')

module.exports = {
  documents (user, args, context, info) {
    const { user: me } = context
    if (Roles.userIsMeOrHasProfile(user, me)) {
      return documents(user, {
        ...args,
        userId: user.id
      }, context, info)
    }
    return {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      },
      totalCount: 0,
      nodes: []
    }
  }
}
