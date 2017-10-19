/*
 * this script migrates the tables from crowdfunding-backend
 * node script/migrateCF.js PG_USERNAME
 */

const exec = require('child-process-promise').exec
const PgDb = require('../lib/pgdb')

const username = process.argv[2]
if (!username) {
  throw new Error('your (postgres) username must be provided as the first argument to this script')
}

Promise.resolve().then(async () => {
  await exec(`dropdb republik`)
    .then(r => console.log(r.stdout, r.stderr))
  await exec(`createdb republik`)
    .then(r => console.log(r.stdout, r.stderr))

  const DATABASE_URL = `postgres://${username}@localhost:5432/republik`
  await exec(`pg_dump postgres://${username}@localhost:5432/postgres | psql ${DATABASE_URL}`)
    .then(r => console.log(r.stdout, r.stderr))

  process.env.DATABASE_URL = DATABASE_URL
  const pgdb = await PgDb.connect()

  await pgdb.run(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS
      "facebookId"     text,
    ADD COLUMN IF NOT EXISTS
      "twitterHandle"  text,
    ADD COLUMN IF NOT EXISTS
      "publicUrl"      text,
    ADD COLUMN IF NOT EXISTS
      "isEmailPublic"  boolean not null default false,
    ADD COLUMN IF NOT EXISTS
      "isPrivate"      boolean not null default false;

    CREATE SCHEMA IF NOT EXISTS cf;

    ALTER TABLE IF EXISTS comments SET SCHEMA cf;
  `)

  await pgdb.execute('migrations/sqls/20171001163340-discussion-up.sql')

  await pgdb.run(`
    -- copy existing feeds to new discussions API
    INSERT INTO discussions(id, "maxLength", "minInterval") SELECT id, "commentMaxLength", "commentInterval" FROM feeds;

    INSERT INTO comments(
      "id",
      "discussionId",
      "userId",
      "content",
      "upVotes",
      "downVotes",
      "votes",
      "hottnes",
      "published",
      "adminUnpublished",
      "createdAt",
      "updatedAt"
    ) SELECT
      "id",
      "feedId",
      "userId",
      "content",
      "upVotes",
      "downVotes",
      "votes",
      "hottnes",
      "published",
      "adminUnpublished",
      "createdAt",
      "updatedAt"
    FROM cf.comments;
  `)
})
.then(() => {
  process.exit(0)
})
