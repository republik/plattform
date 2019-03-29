// syncs electionCandidacies.comment.content <- user.statement
//
// usage:
// node packages/voting/scripts/syncCandidacies.js

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

PgDb.connect().then(async pgdb => {
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
    GROUP BY
      1
  `).then(cs => cs.map(c => ({ ...c, user: c.user[0], comment: c.comment[0] })))
  await Promise.all(
    candidacies.map(c => {
      if (c.comment && c.user.statement !== c.comment.content) {
        console.log(`updating ${c.user.firstName} ${c.user.lastName}...`)
        return pgdb.public.comments.updateOne(
          { id: c.comment.id },
          { content: c.user.statement }
        )
      }
    })
  )
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
