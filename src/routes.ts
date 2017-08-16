import * as createRoutes from 'next-routes'

const routes = createRoutes()
routes
  .add('users')
  .add('payments')
  .add('postfinance-payments')
  .add('merge-users')
  .add('user', '/users/:userId', 'user')

export default routes
export const Router = routes.Router
