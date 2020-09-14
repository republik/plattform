const moment = require('moment')

const findByUser = async (user, pgdb) => {
  const candidacies = await pgdb.public.electionCandidacies.find({
    userId: user.id,
  })

  if (candidacies.length < 1) {
    return []
  }

  const address = await pgdb.public.addresses.findOne({ id: user.addressId })
  Object.assign(user, { address })

  const comments = await pgdb.public.comments.find({
    id: candidacies.map((candidacy) => candidacy.commentId),
  })

  const elections = await pgdb.public.elections.find({
    id: candidacies.map((candidacy) => candidacy.electionId),
  })

  return candidacies.map((candidacy) => ({
    ...candidacy,
    user,
    election: elections.find(
      (election) => election.id === candidacy.electionId,
    ),
    comment: comments.find((comment) => comment.id === candidacy.commentId),
  }))
}

const findById = async (id, pgdb) => {
  const candidacy = await pgdb.public.electionCandidacies.findOne({ id })

  const user = await pgdb.public.users.findOne({ id: candidacy.userId })

  const address = await pgdb.public.addresses.findOne({ id: user.addressId })
  Object.assign(user, { address })

  const comment = await pgdb.public.comments.findOne({
    id: candidacy.commentId,
  })

  const election = await pgdb.public.elections.findOne({
    id: candidacy.electionId,
  })

  return {
    ...candidacy,
    user,
    election,
    comment,
  }
}

const hasUserCandidacies = async (user, pgdb) =>
  (await pgdb.public.electionCandidacies.count({ userId: user.id })) > 0

const getPhase = (election) => {
  const now = moment()
  if (
    moment(election.candidacyBeginDate) <= now &&
    moment(election.candidacyEndDate) > now
  ) {
    return 'candidacy'
  }
  if (
    (moment(election.candidacyBeginDate) <= now ||
      moment(election.beginDate) <= now) &&
    moment(election.endDate) > now
  ) {
    return 'election'
  }
}

const userCandidacies = async (userId, pgdb) => {
  return pgdb
    .query(
      `
    SELECT
      c.*,
      json_agg(e.*) as election
    FROM
      "electionCandidacies" c
    JOIN
      elections e
      ON c."electionId" = e.id
    WHERE
      c."userId" = :userId
    GROUP BY
      1
  `,
      {
        userId,
      },
    )
    .then((cs) => cs.map((c) => ({ ...c, election: c.election[0] })))
    .then((cs) =>
      cs.map((c) => ({
        ...c,
        election: {
          ...c.election,
          phase: getPhase(c.election),
        },
      })),
    )
}

const hasUserCandidaciesInCandidacyPhase = async (user, pgdb) => {
  const candidacies = await userCandidacies(user.id, pgdb)
  return !!candidacies.find((c) => c.election.phase === 'candidacy')
}

const hasUserCandidaciesInElectionPhase = async (user, pgdb) => {
  const candidacies = await userCandidacies(user.id, pgdb)
  return !!candidacies.find((c) => c.election.phase === 'election')
}

module.exports = {
  findByUser,
  findById,
  hasUserCandidacies,
  hasUserCandidaciesInCandidacyPhase,
  hasUserCandidaciesInElectionPhase,
}
