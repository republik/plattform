const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  name: (user) => transformUser(user).name,
  email: (user) => transformUser(user).email
}
