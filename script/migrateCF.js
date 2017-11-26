/*
 * This script migrates the crowdfunding-backend DB to the republik-backend DB schema.
 * This script is not idempotent, don't run it twice.
 * usage:
 * node script/migrateCF.js [PG_USERNAME]
 *
 * If you provide PG_USERNAME, this script first clones the local DB named
 * postgres (crowdfunding default) to the local DB named republik.
 * Then it continues to convert that cloned DB. This doesn't work on heroku.
 *
 * If you omitt PG_USERNAME this script expects a DB in the crowdfunding-backend schema at
 * DATABASE_URL and converts it to match the schema necessary for republik-backend.
 *
 * To get the data to heroku either: (all commands in this repos root, with heroku remote present)
 *   - do the convertion locally and push your local DB to heroku:
 *     heroku pg:push postgres://PG_USERNAME@localhost:5432/republik HEROKU_DATABASE_URL
 *     heroku restart
 *   - clone the crowdfunding DB to the republik DB, then convert:
 *     heroku pg:copy r-cf-api::HEROKU_POSTGRESQL_OLIVE_URL HEROKU_DATABASE_URL -a republik-api-staging
 *     heroku run node script/migrateCF.js
 *     heroku restart
 */

const exec = require('child-process-promise').exec

const username = process.argv[2]

Promise.resolve().then(async () => {
  if (username) {
    await exec(`dropdb republik`)
      .then(r => console.log(r.stdout, r.stderr))
      .catch(e => {})
    await exec(`createdb republik`)
      .then(r => console.log(r.stdout, r.stderr))

    const DATABASE_URL = `postgres://${username}@localhost:5432/republik`

    await exec(`pg_dump postgres://${username}@localhost:5432/postgres | psql ${DATABASE_URL}`)
      .then(r => console.log(r.stdout, r.stderr))

    process.env.DATABASE_URL = DATABASE_URL
  } else {
    require('dotenv').config()
  }
  const { lib: { pgdb: PgDb } } = require('@orbiting/backend-modules-base')
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

  await pgdb.query(`
    UPDATE
      users
    SET
      roles = COALESCE(roles, '[]'::jsonb)::jsonb || :role::jsonb
    WHERE
      (roles IS NULL OR NOT roles @> :role) AND
      id IN (
        SELECT
          u.id
        FROM
          users u
        JOIN
          memberships m
          ON m."userId" = u.id
      )
  `, {
    role: JSON.stringify(['member'])
  })
})
.then(() => {
  process.exit(0)
})
