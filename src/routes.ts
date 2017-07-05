import * as createRoutes from 'next-routes'

const routes = createRoutes()
routes.add('users').add('user', '/users/:userId', 'user')

export default routes
