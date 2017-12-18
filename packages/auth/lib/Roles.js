const t = require('./t')

const roles = [
  'editor'
]

const userHasRole = (user, role) => {
  return user && user.roles && user.roles.indexOf(role) > -1
}

const ensureUserHasRole = (user, role) => {
  if (!user) {
    console.info('signIn', { stack: new Error().stack })
    throw new Error(t('api/signIn'))
  }
  if (!userHasRole(user, role)) {
    console.info('unauthorized', { stack: new Error().stack })
    throw new Error(t.pluralize('api/unauthorized', {
      count: 1,
      role: `«${role}»`
    }))
  }
}


const userIsInRoles = (user, roles = []) => {
  const matches = roles.filter( role =>
    userHasRole(user, role)
  )
  return matches.length > 0
}

const ensureUserIsInRoles = (user, roles) => {
  if (!user) {
    console.info('signIn', { stack: new Error().stack })
    throw new Error(t('api/signIn'))
  }
  if(!userIsInRoles(user, roles)) {
    console.info('unauthorized', { stack: new Error().stack })
    throw new Error(t.pluralize('api/unauthorized', {
      count: roles.length,
      role: roles
        .map( role => `«${role}»`)
        .join(', ')
    }))
  }
}


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

const userIsMe = (user, me) => (
  me && me.id === user.id
)

const userIsMeOrInRoles = (user, me, roles) => (
  userIsMe(user, me) ||
  userIsInRoles(user, roles)
)

const userIsMeOrHasProfile = (user, me) => (
  user._data.hasPublicProfile ||
  userIsMe(user, me)
)

module.exports = {
  roles,
  userHasRole,
  ensureUserHasRole,
  userIsInRoles,
  userIsMe,
  userIsMeOrInRoles,
  userIsMeOrHasProfile,
  ensureUserIsInRoles,
  addUserToRole,
  removeUserFromRoll
}
