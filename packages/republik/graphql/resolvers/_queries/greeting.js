const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { t, redis, user }) => {
  Roles.ensureUserHasRole(user, 'member')
  let greeting
  try {
    greeting = JSON.parse(await redis.getAsync('greeting'))
  } catch (e) {}

  if (greeting &&
    greeting.text &&
    greeting.text.length > 0) {
    return greeting
  }

  return {
    text: t('api/greeting')
  }
}
