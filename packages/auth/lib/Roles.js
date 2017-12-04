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


const userIsInRoles = (user, roles) => {
  if (!user || !user.roles || user.roles.length < 1) {
    return false
  }
  const matches = user.roles.filter( role =>
    roles.indexOf(role) > -1
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

module.exports = {
  roles,
  userHasRole,
  ensureUserHasRole,
  userIsInRoles,
  ensureUserIsInRoles,
  addUserToRole,
  removeUserFromRoll
}
