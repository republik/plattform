// copies selected candidacies from one election to another,
// creating a new comment along the way
//
// reads config from stdin. format:
// {
//  "newElectionId": "a45f4f7b-31a2-4fd8-a45e-e72f9b0fdd3b",
//  "candidacyIds": [
//    "00000000-0000-0000-0000-000000000001",
//    "00000000-0000-0000-0000-000000000002",
//    "00000000-0000-0000-0000-000000000003"
//  ]
// }
//
// usage:
// cat packages/voting/scripts/local/presidency.json | node packages/voting/scripts/copyCandidacies.js

const rw = require('rw')
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const config = JSON.parse(rw.readFileSync('/dev/stdin', 'utf8'))
if (!config.newElectionId) {
  throw new Error('missing newElectionId in config')
}
if (!config.candidacyIds || config.candidacyIds.length <= 0) {
  throw new Error('missing candidacyIds in config')
}

PgDb.connect().then(async pgdb => {
  const newElection = await pgdb.public.elections.findOne({ id: config.newElectionId })
  if (!newElection) {
    throw new Error(`newElection not found (${config.newElectionId})`)
  }
  const candidacies = await pgdb.query(`
    SELECT
      ec.*,
      json_agg(u.*) as user,
      json_agg(c.*) FILTER (WHERE c.id IS NOT NULL) as comment
    FROM
      "electionCandidacies" ec
    JOIN
      users u
      ON ec."userId" = u.id
    LEFT JOIN
      comments c
      ON ec."commentId" = c.id
    WHERE
      ARRAY[ec.id] && :candidacyIds
    GROUP BY
      1
  `, {
    candidacyIds: config.candidacyIds
  }).then(cs => cs.map(c => ({ ...c, user: c.user[0], comment: c.comment[0] })))
  if (candidacies.length !== config.candidacyIds.length) {
    throw new Error('some of the requested candidates could not be found', candidacies, config.candidacyIds)
  }
  const now = new Date()
  await Promise.all(
    candidacies.map(async c => {
      const existingCandidacy = await pgdb.public.electionCandidacies.findOne({
        electionId: newElection.id,
        userId: c.user.id
      })
      if (existingCandidacy) {
        console.log(`skipping ${c.user.firstName} ${c.user.lastName} exists as ${existingCandidacy.id}`)
        return
      }
      console.log(`copying ${c.user.firstName} ${c.user.lastName}...`)
      const newComment = await pgdb.public.comments.insertAndGet({
        discussionId: newElection.discussionId,
        userId: c.user.id,
        content: c.user.statement,
        hotness: 0.0,
        createdAt: now,
        updatedAt: now
      })
      await pgdb.public.electionCandidacies.insert({
        recommendation: c.recommendation,
        userId: c.userId,
        electionId: newElection.id,
        commentId: newComment.id,
        createdAt: now,
        updatedAt: now
      })
    })
  )
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
