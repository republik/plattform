const findByUser = async (user, pgdb) => {
  const candidacies =
    await pgdb.public.electionCandidacies.find({ userId: user.id })

  if (candidacies.length < 1) {
    return []
  }

  const address =
    await pgdb.public.addresses.findOne({
      id: user.addressId
    })

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
    user: Object.assign(user, { address }),
    election: elections.find(election => election.id === candidacy.electionId),
    comment: comments.find(comment => comment.id === candidacy.commentId)
  }))
}

module.exports = {
  findByUser
}
