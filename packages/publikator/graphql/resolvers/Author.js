const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  user: async (author) => author.user && transformUser(author.user),
}
