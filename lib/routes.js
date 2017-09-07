const nextRoutes = require('next-routes')
const routes = nextRoutes()

routes
  .add('index', '/')
  .add('lorem', '/lorem')
  .add('editor/edit', '/stories/edit/:repository/:commit?')
  .add('editor/tree', '/stories/tree/:repository/:commit?')
  .add('editor/publish', '/stories/publish/:repository/:commit?')

module.exports = routes
