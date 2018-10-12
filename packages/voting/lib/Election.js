const { buildQueries } = require('./queries.js')
const queries = buildQueries('elections')

const slugExists = async (slug, pgdb) => {
  return !!(await pgdb.public.elections.findFirst({
    slug
  }))
}

const create = async (input, pgdb) =>
  pgdb.public.elections.insertAndGet(input)

const getCandidacies = async (election, pgdb) => {
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
}

module.exports = {
  ...queries,
  slugExists,
  create,
  getCandidacies
}
