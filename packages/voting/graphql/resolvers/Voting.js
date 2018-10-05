const {
  isEligible,
  numEligible
} = require('../../lib/votings')

module.exports = {
  slug ({ id, slug }) {
    if (slug) {
      return slug
    } else {
      return id
    }
  },
  async options (voting, args, { pgdb }) {
    return pgdb.public.votingOptions.find({ votingId: voting.id })
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
      eligible: await numEligible(pgdb),
      submitted: await pgdb.public.ballots.count({ votingId: voting.id })
    }
  },
  async userIsEligible (voting, args, { pgdb, user: me }) {
    return isEligible(me && me.id, pgdb)
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
  }
  /* either voting.result is freezed into crowdfunding by countVoting
     or it must remain null. For live voting stats, the counts query from
     count voting has to be migrated into an apollo resolver, to provide
     VoteResult.options
  result (voting, args, {pgdb, user}) {
    return voting.result || {voting}
  }
  */
}
