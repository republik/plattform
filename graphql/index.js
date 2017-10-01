const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const { makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools')
const { execute, subscribe } = require('graphql')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const t = require('../lib/t')

const Schema = require('./schema')
const Resolvers = require('./resolvers/index')

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
})

addMockFunctionsToSchema({
  schema: executableSchema,
  preserveResolvers: true
})

const {
  NODE_ENV
} = process.env

module.exports = (server, pgdb, httpServer) => {
  const graphqlMiddleware = graphqlExpress((req) => {
    return {
      debug: false,
      formatError: (error) => {
        console.error('error in graphql', error)
        return error
      },
      schema: executableSchema,
      context: {
        pgdb,
        user: req.user,
        req,
        t,
      }
    }
  })

  server.use('/graphql',
    bodyParser.json({limit: '64mb'}),
    graphqlMiddleware
  )
  server.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
  }))
}
