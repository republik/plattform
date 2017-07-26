const { createApolloFetch } = require('apollo-fetch')

module.exports.githubFetch = createApolloFetch({
  uri: 'https://api.github.com/graphql'
}).use(({ request, options }, next) => {
  console.log(request)
  console.log(options)
  if (!options.headers) {
    options.headers = {}
  }
  options.headers['Authorization'] = `Bearer ${request.user.githubAccessToken}`

  next()
})
