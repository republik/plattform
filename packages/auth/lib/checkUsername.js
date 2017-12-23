const t = require('./t')

module.exports = async (username, me, pgdb) => {
  const min = 3
  if (!username || username.length < min) {
    throw new Error(t('api/checkUsername/min', {
      count: min
    }))
  }
  const max = 20
  if (username.length > max) {
    throw new Error(t('api/checkUsername/max', {
      count: max
    }))
  }

  if (!username.match(/^[.a-z0-9]+$/)) {
    throw new Error(t('api/checkUsername/invalid'))
  }

  const id = await pgdb.public.users.findOneFieldOnly({username}, 'id')
  if (!id || (me && me.id === id)) {
    return true
  }
  throw new Error(t('api/checkUsername/taken'))
}
