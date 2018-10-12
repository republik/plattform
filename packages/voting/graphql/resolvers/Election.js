const { Roles } = require('@orbiting/backend-modules-auth')

const {
  isEligible,
  userHasSubmitted,
  userSubmitDate,
  turnout
} = require('../../lib/Election')

module.exports = {
  // either result is freezed into db by countVoting or it must remain null.
  async discussion (election, args, { user: me, pgdb }) {
    return pgdb.public.discussions.findOne({ id: election.discussionId })
  },
  async candidacies (election, args, { user: me, pgdb }) {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return []
    }

    const candidacies = await pgdb.public.electionCandidacies.find({ electionId: election.id })

    const users = candidacies.length > 0
      ? await pgdb.public.users.find({id: candidacies.map(candidate => candidate.userId)})
      : []

    const addresses = users.length > 0
      ? await pgdb.public.addresses.find({id: users.map(user => user.addressId)})
      : []

    const usersWithAddresses = users.map(user => ({
      ...user,
      address: addresses.find(address => address.id === user.addressId)
    }))

    const comments = await pgdb.public.comments.find({ discussionId: election.discussionId })

    return candidacies.map(candidacy => ({
      ...candidacy,
      user: usersWithAddresses.find(user => user.id === candidacy.userId),
      election,
      comment: comments.find(comment => comment.id === candidacy.commentId)
    }))
  },
  async userIsEligible (entity, args, { pgdb, user: me }) {
    return isEligible(me && me.id, entity, pgdb)
  },
  async userHasSubmitted (entity, args, { pgdb, user: me }) {
    return userHasSubmitted(entity.id, me && me.id, pgdb)
  },
  async userSubmitDate (entity, args, { pgdb, user: me }) {
    return userSubmitDate(entity.id, me && me.id, pgdb)
  },
  async turnout (election, args, { pgdb }) {
    if (election.result && election.result.turnout) { // after counting
      return election.result.turnout
    }
    return turnout(election, pgdb)
  }
}
