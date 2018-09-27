const findByUser = async (user, pgdb) => {
  const candidacies =
    await pgdb.public.electionCandidacies.find({ userId: user.id })

  if (candidacies.length < 1) {
    return []
  }

  const address = await pgdb.public.addresses.findOne({ id: user.addressId })
  Object.assign(user, { address })

  const comments =
    await pgdb.public.comments.find({
      id: candidacies.map(candidacy => candidacy.commentId)
    })

  const elections =
    await pgdb.public.elections.find({
      id: candidacies.map(candidacy => candidacy.electionId)
    })

  return candidacies.map(candidacy => ({
    ...candidacy,
    user,
    election: elections.find(election => election.id === candidacy.electionId),
    comment: comments.find(comment => comment.id === candidacy.commentId)
  }))
}

const findById = async (id, pgdb) => {
  const candidacy =
    await pgdb.public.electionCandidacies.findOne({id})

  const user = await pgdb.public.users.findOne({id: candidacy.userId})

  const address = await pgdb.public.addresses.findOne({ id: user.addressId })
  Object.assign(user, { address })

  const comment =
    await pgdb.public.comments.findOne({ id: candidacy.commentId })

  const election =
    await pgdb.public.elections.findOne({ id: candidacy.electionId })

  return {
    ...candidacy,
    user,
    election,
    comment
  }
}

module.exports = {
  findByUser,
  findById
}
