const createRoutes = require('next-routes')
const routes = createRoutes()

routes
  .add('users')
  .add('maillog')
  .add('payments')
  .add('postfinance-payments')
  .add('merge-users')
  .add('user', '/users/:userId')

module.exports = routes
