const { Roles } = require('@orbiting/backend-modules-auth')

const candidaciesLib = require('../../lib/Candidacy')

module.exports = {
  candidacies: async (user, args, { user: me, pgdb }) => {
    if (!Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return []
    }

    return candidaciesLib.findByUser(user._raw, pgdb)
  },
  questionnaireSubmissions: async (user, args, { pgdb }) => {
    const nodes = await pgdb.public.questionnaireSubmissions.find(
      { userId: user.id },
      { limit: 5 },
    )

    if (!nodes?.length) {
      return null
    }

    return {
      nodes,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: nodes?.length || 0,
    }
  },
}
