const _ = require('lodash')
const { descending } = require('d3-array')

const { buildQueries } = require('./queries.js')
const queries = buildQueries('elections')
const {
  findBySlug,
  insertAllowedMemberships
} = queries
const finalizeLib = require('./finalize.js')

const create = async (input, pgdb) => {
  const election = await pgdb.public.elections.insertAndGet(
    _.omit(input, ['allowedMemberships'])
  )

  if (input.allowedMemberships && input.allowedMemberships.length > 0) {
    await insertAllowedMemberships(election.id, input.allowedMemberships, pgdb)
  }

  return findBySlug(input.slug, pgdb)
}

const getCandidacies = async (election, pgdb) => {
  const candidacies = await pgdb.public.electionCandidacies.find({ electionId: election.id })

  const users = candidacies.length > 0
    ? await pgdb.public.users.find({id: candidacies.map(candidacy => candidacy.userId)})
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
}

const getCandidaciesResult = async (election, { manuallyElectedCandidacyIds }, pgdb, t) => {
  const { numSeats } = election

  const counts = await pgdb.query(`
    SELECT
      COUNT(*) AS count,
      "candidacyId"
    FROM
      "electionBallots"
    WHERE
      "electionId" = :electionId
    GROUP BY
      "candidacyId"
    ORDER BY
      count DESC
  `, {
    electionId: election.id
  })
  const nonEmptyCounts = counts.filter(c => !!c.candidacyId)

  let electedCandidacyIds
  // check if there are undecided seats
  const lastElectedCandidate = nonEmptyCounts[numSeats - 1]
  const firstMissedCandidacy = nonEmptyCounts[numSeats]
  if (
    lastElectedCandidate && firstMissedCandidacy &&
    lastElectedCandidate.count === firstMissedCandidacy.count
  ) {
    if (!manuallyElectedCandidacyIds || !manuallyElectedCandidacyIds.length) {
      throw new Error(t('api/election/result/needDecision'))
    }
    electedCandidacyIds = nonEmptyCounts
      .filter(c => manuallyElectedCandidacyIds.indexOf(c.candidacyId) > -1)
      .map(c => c.candidacyId)
    if (electedCandidacyIds.length < manuallyElectedCandidacyIds) {
      throw new Error(t('api/election/result/invalidCandidacyIdSupplied'))
    }
  } else {
    electedCandidacyIds = nonEmptyCounts
      .slice(0, numSeats)
      .map(c => c.candidacyId)
  }

  return getCandidacies(election, pgdb)
    .then(candidacies => candidacies
      .map(candidacy => {
        const countResult = counts.find(c => c.candidacyId === candidacy.id)
        return {
          candidacy,
          count: countResult ? countResult.count : 0,
          elected: electedCandidacyIds.indexOf(candidacy.id) > -1
        }
      })
      .sort((a, b) => descending(a.count, b.count) || descending(a.elected, b.elected))
    )
    .then(candidacies => {
      const emptyBallotsResult = counts.find(c => c.candidacyId === null)
      if (emptyBallotsResult) {
        return candidacies.concat({
          candidacy: null,
          count: emptyBallotsResult.count,
          elected: false
        })
      }
      return candidacies
    })
}

const finalize = async (election, args, pgdb, t) => {
  const result = {
    candidacies: await getCandidaciesResult(election, args, pgdb, t),
    turnout: await queries.turnout(election, pgdb)
  }
  return finalizeLib('elections', election, result, args, pgdb)
}

module.exports = {
  ...queries,
  create,
  getCandidacies,
  getCandidaciesResult,
  finalize
}
