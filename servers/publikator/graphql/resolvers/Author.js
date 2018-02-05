const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  user: async (author, args, { pgdb }) => {
    const { email } = author
    const user = await pgdb.public.users.findOne({ email })
    return user && transformUser(user)
  }
}
