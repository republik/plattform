const {
  transformUser
} = require('@orbiting/backend-modules-auth')

const resolveCandidate = async (pgdb, candidate) => {
  const u = await pgdb.public.users.findOne({id: candidate.userId})
  const user = transformUser(u)
  const discussion = await pgdb.public.comments.findOne({id: candidate.commentId})

  return {
    id: candidate.id,
    electionId: candidate.electionId,
    recommendation: candidate.recommendation,
    yearOfBirth: new Date(user._raw.birthday).getFullYear(),
    city: (await pgdb.public.addresses.findOne({id: user._raw.addressId})).city,
    discussion,
    user
  }
}

module.exports = resolveCandidate
