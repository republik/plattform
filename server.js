const { server } = require('@orbiting/backend-modules-base')

const { express: { assets, pageRenderer } } = require('@orbiting/backend-modules-assets')

module.exports.run = () => {
  // middlewares
  const middlewares = [
    assets,
    pageRenderer
  ]

  return server.run(null, middlewares)
}

module.exports.close = () => {
  server.close()
}
