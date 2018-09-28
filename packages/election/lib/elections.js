const debug = require('debug')('elections:lib:elections')

const getConditions = () => ({
  active: true,
  'endDate >': Date.now()
})

const findBySlug = async (slug, election, pgdb) => {
  debug('findBySlug', { slug, hasElection: !!election })

  if (!election) {
    election = await pgdb.public.elections.findOne(
      { slug, ...getConditions() }
    )
  }

  const candidacies =
    await pgdb.public.electionCandidacies.find({ electionId: election.id })

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

  const comments =
    await pgdb.public.comments.find({ discussionId: election.discussionId })

  const discussion =
    await pgdb.public.discussions.findOne({id: election.discussionId})

  election.discussion = discussion

  election.candidacies = candidacies.map(candidacy => ({
    ...candidacy,
    user: usersWithAddresses.find(user => user.id === candidacy.userId),
    election,
    comment: comments.find(comment => comment.id === candidacy.commentId)
  }))

  return election
}

const findAvailable = async (pgdb) => {
  debug('findAvailable')

  const elections = []
  const electionsBare = await pgdb.public.elections.find(getConditions())

  for (const election of electionsBare) {
    elections.push(await findBySlug(election.slug, election, pgdb))
  }

  return elections
}

module.exports = {
  findBySlug,
  findAvailable
}
