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

const logProxyQueries = process.env.LOG_PROXY
const util = require('util')

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
    if (logProxyQueries) {
      console.log('\nrequest: ---------------')
      console.log(util.inspect(req.body, {depth: null}))
    }

    const githubFetch = createApolloFetch({
      uri: 'https://api.github.com/graphql'
    }).use(({ request, options }, next) => {
      if (!options.headers) {
        options.headers = {}
      }
      options.headers['Authorization'] = `Bearer ${req.user.githubAccessToken}`

      next()
    })
    githubFetch(req.body).then(result => {
      if (logProxyQueries) {
        console.log('\nresponse: --------------')
        console.log(util.inspect(result, {depth: null}))
      }
      return res.json(result)
    }).catch(error => {
      if (logProxyQueries) {
        console.log('\nerror: -----------------')
        console.log(util.inspect(error, {depth: null}))
      }
      return res.status(503).json({
        errors: [error.toString()]
      })
    })
  })
  server.use(
    '/github/graphiql',
    graphiqlExpress({
      endpointURL: '/github/graphql'
    })
  )
}
