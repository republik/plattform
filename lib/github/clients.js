const { createApolloFetch } = require('apollo-fetch')
const GitHubApi = require('github')
const appAuth = require('./appAuth')

let installationToken

module.exports = async () => {
  const nearFuture = new Date()
  nearFuture.setMinutes(nearFuture.getMinutes() + 15)
  if (!installationToken || installationToken.expiresAt < nearFuture) {
    installationToken = await appAuth.getInstallationToken()
  }

  const githubApolloFetch = createApolloFetch({
    uri: 'https://api.github.com/graphql'
  })
  .use(({ options }, next) => {
    if (!options.headers) {
      options.headers = {}
    }
    options.headers['Authorization'] = `Bearer ${installationToken.token}`
    options.headers['Accept'] = 'application/vnd.github.machine-man-preview+json'
    next()
  })
  .useAfter(({ response }, next) => {
    if (response && response.parsed && response.parsed.errors) {
      const errors = response.parsed.errors
      // console.log(response)
      throw new Error(JSON.stringify(errors))
    }
    next()
  })

  const githubRest = new GitHubApi({
    headers: {
      'Accept': 'application/vnd.github.machine-man-preview+json, application/vnd.github.mercy-preview+json'
    }
  })
  githubRest.authenticate({
    type: 'integration',
    token: installationToken.token
  })

  return {
    githubApolloFetch,
    githubRest
  }
}
