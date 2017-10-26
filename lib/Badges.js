const { parse, Source } = require('graphql')
const Schema = require('../graphql/schema')

// Retrieve supported badges from Badge enum in schema.
const SUPPORTED_BADGES = parse(new Source(Schema[0]))
  .definitions.find(
    definition =>
      definition.kind === 'EnumTypeDefinition' &&
      definition.name &&
      definition.name.value === 'Badge'
  )
  .values.map(value => value.name.value)
exports.SUPPORTED_BADGES = SUPPORTED_BADGES

const userHasBadge = (user, badge) => {
  return user && user.badges && user.badges.indexOf(badge) > -1
}
exports.userHasBadge = userHasBadge

const addToUser = async (userId, badge, pgdb) => {
  await pgdb.query(`
    UPDATE
      users
    SET
      badges = COALESCE(badges, '[]'::jsonb)::jsonb || :badge::jsonb
    WHERE
      id = :userId AND
      (badges IS NULL OR NOT badges @> :badge)
  `, {
    badge: JSON.stringify([badge]),
    userId
  })
  return pgdb.public.users.findOne({id: userId})
}
exports.addToUser = addToUser

const removeFromUser = async (userId, badge, pgdb) => {
  await pgdb.query(`
    UPDATE
      users
    SET
      badges = badges - :badge
    WHERE
      id = :userId
  `, {
    badge,
    userId
  })
  return pgdb.public.users.findOne({id: userId})
}
exports.removeFromUser = removeFromUser
