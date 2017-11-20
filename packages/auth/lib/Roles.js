const t = require('./t')

const roles = [
  'editor'
]
exports.roles = roles

const userHasRole = (user, role) => {
  return user && user.roles && user.roles.indexOf(role) > -1
}
exports.userHasRole = userHasRole

const ensureUserHasRole = (user, role) => {
  if (!user) {
    console.info('signIn', { stack: new Error().stack })
    throw new Error(t('api/signIn'))
  }
  if (!userHasRole(user, role)) {
    console.info('unauthorized', { stack: new Error().stack })
    throw new Error(t('api/unauthorized', {role}))
  }
}
exports.ensureUserHasRole = ensureUserHasRole

const addUserToRole = async (userId, role, pgdb) => {
  await pgdb.query(`
    UPDATE
      users
    SET
      roles = COALESCE(roles, '[]'::jsonb)::jsonb || :role::jsonb
    WHERE
      id = :userId AND
      (roles IS NULL OR NOT roles @> :role)
  `, {
    role: JSON.stringify([role]),
    userId
  })
  return pgdb.public.users.findOne({id: userId})
}
exports.addUserToRole = addUserToRole

const removeUserFromRoll = async (userId, role, pgdb) => {
  await pgdb.query(`
    UPDATE
      users
    SET
      roles = roles - :role
    WHERE
      id = :userId
  `, {
    role,
    userId
  })
  return pgdb.public.users.findOne({id: userId})
}
exports.removeUserFromRoll = removeUserFromRoll
