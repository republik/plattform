import * as createRoutes from 'next-routes'

const routes = createRoutes()
routes
  .add('users')
  .add('payments')
  .add('user', '/users/:userId', 'user')

export default routes
