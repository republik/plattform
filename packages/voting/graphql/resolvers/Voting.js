const {
  isEligible,
  numEligible
} = require('../../lib/Voting')

module.exports = {
  slug ({ id, slug }) {
    if (slug) {
      return slug
    } else {
      return id
    }
  },
  async options (voting, args, { pgdb }) {
    return pgdb.public.votingOptions.find({
      votingId: voting.id
    })
  },
  async discussion (voting, args, { pgdb }) {
    if (!voting.discussionId) {
      return
    }
    return pgdb.public.discussions.findOne({
      id: voting.discussionId
    })
  },
  async userIsEligible (voting, args, { pgdb, user: me }) {
    return isEligible(me && me.id, voting, pgdb)
  },
  async userHasSubmitted (voting, args, { pgdb, user: me }) {
    if (!me) { return false }

    return !!(await pgdb.public.ballots.findFirst({
      userId: me.id,
      votingId: voting.id
    }))
  },
  async userSubmitDate (voting, args, { pgdb, user: me }) {
    if (!me) { return false }

    const ballot = await pgdb.public.ballots.findFirst({
      userId: me.id,
      votingId: voting.id
    })

    if (!ballot) { return }

    return ballot.updatedAt
  },
  async turnout (voting, args, { pgdb }) {
    if (voting.result && voting.result.turnout) { // cached by countVoting
      const { turnout } = voting.result
      return {
        ...turnout,
        eligible: turnout.eligible || turnout.eligitable // fix typo in old data
      }
    }
    return {
      eligible: await numEligible(voting, pgdb),
      submitted: await pgdb.public.ballots.count({ votingId: voting.id })
    }
  }
  /* either voting.result is freezed into crowdfunding by countVoting
     or it must remain null. */
}
