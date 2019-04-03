/**
 * This script checks who bought sth. or claimed a membership
 * and inserts consents.
 *
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const {
  PARKING_USER_ID
} = process.env

console.log('running reconstructConsents.js...')
PgDb.connect().then(async pgdb => {
  await pgdb.query(`
WITH mts_projectr AS (
  SELECT
    id
  FROM
    "membershipTypes"
  WHERE
    name != 'MONTHLY_ABO'
), result AS (
  SELECT
    u.id AS "userId",
    coalesce(array_length(array_remove(array_agg(DISTINCT m_projectr.id), NULL), 1), 0) as "numMembershipsProjectR",
    coalesce(array_length(array_remove(array_agg(DISTINCT m_republik.id), NULL), 1), 0) as "numMembershipsRepublik",
    coalesce(array_length(array_remove(array_agg(DISTINCT p.id), NULL), 1), 0) as "numPledges",
    LEAST(
      min(m_projectr."createdAt"),
      min(m_republik."createdAt"),
      min(p."createdAt")
    ) AS "createdAt"
  FROM
    users u
  LEFT JOIN
    memberships m_projectr
    ON
      u.id=m_projectr."userId" AND
      m_projectr."membershipTypeId" IN (SELECT id FROM mts_projectr)
  LEFT JOIN
    memberships m_republik
    ON
      u.id=m_republik."userId" AND
      m_republik."membershipTypeId" NOT IN (SELECT id FROM mts_projectr)
  LEFT JOIN
    pledges p
    ON
      u.id=p."userId" AND
      p.status != 'DRAFT'
  WHERE
    u.id != :excludeUserId
  GROUP BY
    u.id
  ORDER BY
    3 DESC, 4 DESC
), insert_1 AS (
  INSERT INTO
    consents ("userId", "createdAt", "policy")
  SELECT
    "userId", "createdAt", 'PRIVACY'
  FROM
    result
  WHERE
    "numMembershipsProjectR" > 0 OR
    "numMembershipsRepublik" > 0 OR
    "numPledges" > 0
), insert_2 AS (
  INSERT INTO
    consents ("userId", "createdAt", "policy")
  SELECT
    "userId", "createdAt", 'TOS'
  FROM
    result
  WHERE
    "numMembershipsProjectR" > 0 OR
    "numMembershipsRepublik" > 0 OR
    "numPledges" > 0
), insert_3 AS (
  INSERT INTO
    consents ("userId", "createdAt", "policy")
  SELECT
    "userId", "createdAt", 'STATUTE'
  FROM
    result
  WHERE
    "numMembershipsProjectR" > 0
)
SELECT 'DONE'
  `, {
    excludeUserId: PARKING_USER_ID
  })
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
