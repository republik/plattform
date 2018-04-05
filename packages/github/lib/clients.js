const { createApolloFetch } = require('apollo-fetch')
const GitHubApi = require('@octokit/rest')
const appAuth = require('./appAuth')

const {
  GITHUB_LOG_RATELIMIT
} = process.env
const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

let installationToken
let nextRateLimitCheck

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

  if (GITHUB_LOG_RATELIMIT) {
    const now = new Date().getTime()
    if (!nextRateLimitCheck || nextRateLimitCheck <= now) {
      nextRateLimitCheck = now + 15 * 60 * 1000
      githubRest.misc.getRateLimit({})
        .then(response => {
          if (!response.data) {
            console.error('could not get rateLimit!', response)
          } else {
            const { data } = response
            try { // sanitize dates
              data.resources.core.resetDate = new Date(data.resources.core.reset * 1000).toString()
              data.resources.search.resetDate = new Date(data.resources.search.reset * 1000).toString()
              data.resources.graphql.resetDate = new Date(data.resources.graphql.reset * 1000).toString()
              data.rate.resetDate = new Date(data.rate.reset * 1000).toString()
            } catch (e) {}
            const message = {
              message: 'GitHub rate limit',
              level: 'notice',
              data
            }
            if (DEV) {
              const util = require('util')
              console.log(util.inspect(message, null, {depth: null}))
            } else {
              console.log(JSON.stringify(message))
            }
          }
        })
    }
  }

  return {
    githubApolloFetch,
    githubRest
  }
}
