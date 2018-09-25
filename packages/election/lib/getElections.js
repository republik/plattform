const pick = require('lodash/pick')
const keyBy = require('lodash/keyBy')

const {
  transformUser
} = require('@orbiting/backend-modules-auth')

const transformElection = (election) =>
  pick(election, ['id', 'slug', 'description', 'beginDate', 'endDate', 'numSeats'])

const getElections = async (pgdb, where) => {

  const condition = {
    active: true,
    'endDate >': Date.now()
  }

  const elections = where
    ? await pgdb.public.elections.find({...where, ...condition})
    : await pgdb.public.elections.find(condition)

  return Promise.all(
    elections.map(async election => {
      const discussion = await pgdb.public.discussions.findOne({id: election.discussionId})
      const candidacies = keyBy(
        await pgdb.public.electionCandidacies.find({electionId: election.id}),
        e => e.userId
      )

      const candidateIds = Object.keys(candidacies)
      const users = candidateIds.length > 0
        ? await pgdb.public.users.find({id: candidateIds})
        : []

      return {
        ...transformElection(election),
        discussion,
        candidates: Promise.all(users.map(async u => {
          const user = transformUser(u)
          return {
            id: candidacies[u.id].id,
            electionId: candidacies[u.id].electionId,
            recommendation: candidacies[u.id].recommendation,
            yearOfBirth: user._raw.birthday ? new Date(user._raw.birthday).getFullYear() : 0,
            city: (await pgdb.public.addresses.findOne({id: user._raw.addressId})).city,
            user
          }
        }))
      }
    })
  )
}

module.exports = getElections
