const pick = require('lodash/pick')
const resolveCandidate = require('../lib/resolveCandidate')

const transformElection = (election) =>
  pick(election, [
    'id',
    'slug',
    'description',
    'beginDate',
    'endDate',
    'numSeats'
  ])

const getElections = async (pgdb, me, where) => {
  const condition = {
    active: true,
    'endDate >': Date.now()
  }

  const elections = where
    ? await pgdb.public.elections.find({...where, ...condition})
    : await pgdb.public.elections.find(condition)

  return Promise.all(
    elections.map(async election => {
      const discussion =
        await pgdb.public.discussions.findOne({id: election.discussionId})
      const candidacies =
        await pgdb.public.electionCandidacies.find({electionId: election.id})

      return {
        ...transformElection(election),
        candidates: Promise.all(
          candidacies.map(c => resolveCandidate(pgdb, c))
        ),
        discussion,
        userIsEligible: me.roles.some(r => r === 'associate')
      }
    })
  )
}

module.exports = getElections
