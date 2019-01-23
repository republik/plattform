const createRoutes = require('next-routes')
const routes = createRoutes()

routes
  .add('users')
  .add('payments')
  .add('postfinance-payments')
  .add('merge-users')
  .add('user/event-log')
  .add('user/access-grants')
  .add('user/sessions')
  .add('user')

module.exports = routes
