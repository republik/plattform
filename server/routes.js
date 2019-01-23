const createRoutes = require('next-routes')
const routes = createRoutes()

routes
  .add('users')
  .add('payments')
  .add('postfinance-payments')
  .add('merge-users')
  .add('user', '/~:userId')

module.exports = routes
