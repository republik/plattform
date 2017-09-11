const nextRoutes = require('next-routes')
const routes = nextRoutes()

routes
  .add('index', '/')
  .add('lorem', '/lorem')
  .add('repo/edit', '/repo/:repoId*/edit')
  .add('repo/tree', '/repo/:repoId*/tree')
  .add('repo/publish', '/repo/:repoId*/publish')

module.exports = routes
