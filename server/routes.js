const createRoutes = require('next-routes')

const routes = createRoutes()
routes
  .add('users')
  .add('payments')
  .add('postfinance-payments')
  .add('merge-users')
  .add('user', '/users/:userId', 'user')

module.exports = routes
module.exports.Router = routes.Router
