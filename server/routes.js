const nextRoutes = require('next-routes')
const routes = nextRoutes()

routes
  .add('index', '/')
  .add('github', '/github/:login?/:repository?/:view?/:path*')
  .add('editor/list', '/stories/')
  .add('editor/edit', '/stories/edit/:repository/:commit?')
  .add('editor/meta', '/stories/meta/:repository/:commit?')
  .add('editor/tree', '/stories/tree/:repository/:commit?')
  .add('editor/publish', '/stories/publish/:repository/:commit?')

module.exports = routes
