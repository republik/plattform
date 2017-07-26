const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const {makeExecutableSchema} = require('graphql-tools')
const { createApolloFetch } = require('apollo-fetch')

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

  server.post('/github/graphql', bodyParser.json(), (req, res) => {
    const githubFetch = createApolloFetch({
      uri: 'https://api.github.com/graphql'
    }).use(({ request, options }, next) => {
      if (!options.headers) {
        options.headers = {}
      }
      options.headers['Authorization'] = `Bearer ${req.user.githubAccessToken}`

      next()
    })
    githubFetch(req.body).then(result => res.json(result)).catch(error =>
      res.status(503).json({
        errors: [error.toString()]
      })
    )
  })
  server.use(
    '/github/graphiql',
    graphiqlExpress({
      endpointURL: '/github/graphql'
    })
  )
}
