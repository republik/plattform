const nextRoutes = require('next-routes')
const routes = nextRoutes()

routes
  .add('index', '/')
  .add('github', '/github/:organization/:repo?/:path*')

module.exports = routes
