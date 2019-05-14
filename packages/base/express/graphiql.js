const express = require('express')
const path = require('path')

module.exports = (server) => {
  server.use(
    '/graphiql',
    express.static(path.join(__dirname, './graphiql/'))
  )
}

