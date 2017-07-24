const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const {makeExecutableSchema} = require('graphql-tools')

const Schema = require('./schema')
const Resolvers = require('./resolvers/index')

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
})

module.exports = (server, pgdb) => {
  server.use('/graphql',
    bodyParser.json({limit: '8mb'}),
    graphqlExpress((req) => {
      return {
        debug: true,
        schema: executableSchema,
        context: {
          pgdb,
          user: req.user,
          req
        }
      }
    })
  )

  server.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
  }))
}
