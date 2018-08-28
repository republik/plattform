const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  id: (user) => transformUser(user).id,
  name: (user) => transformUser(user).name,
  email: (user) => transformUser(user).email
}
