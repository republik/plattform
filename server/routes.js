const nextRoutes = require('next-routes')
const routes = nextRoutes()

routes
  .add('index', '/')
  .add('github', '/github/:login?/:repository?/:view?/:path*')

module.exports = routes
