const { createApolloFetch } = require('apollo-fetch')
const Bottleneck = require('bottleneck')
const debug = require('debug')('github:clients')

const GitHubApi = require('@octokit/rest')

const appAuth = require('./appAuth')

const {
  REDIS_URL,
  GITHUB_GRAPHQL_RATELIMIT,
  GITHUB_LOG_RATELIMIT
} = process.env

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

let installationToken
let nextRateLimitCheck
let limiter

if (GITHUB_GRAPHQL_RATELIMIT) {
  debug('using bottleneck to limit GitHub GraphQL requests')

  limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 200,
    trackDoneStatus: true,
    id: 'github-graphql-limiter',

    datastore: 'redis',
    clientOptions: {
      url: REDIS_URL
    },

    timeout: 1000 * 30
  })

  limiter.on('err', (err) => {
    console.error(err)
    debug('bottleneck error', err)
  })

  const limiterStats = async () => {
    debug('bottleneck %o', {
      local: limiter.counts(),
      all: {
        running: await limiter.running(),
        done: await limiter.done()
      }
    })
  }

  // Log bottleneck status
  setInterval(limiterStats, 1000 * 10).unref()
}

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
      options.headers.Authorization = `Bearer ${installationToken.token}`
      options.headers.Accept = 'application/vnd.github.machine-man-preview+json'
      next()
    })

  if (GITHUB_GRAPHQL_RATELIMIT) {
    // Limit requests
    githubApolloFetch.use(async ({ options }, next) => {
      limiter.schedule(() => next())
    })

    // Log limit if near rate limit
    githubApolloFetch.useAfter(({ response }, next) => {
      const { headers, raw, parsed } = response

      if (!parsed || !parsed.data) {
        console.error('GitHub GraphQL Error: Missing data prop', { raw, parsed })
        throw new Error('GitHub GraphQL Error: Missing data prop')
      }

      const ratelimit = {
        limit: headers.get('x-ratelimit-limit'),
        remaining: headers.get('x-ratelimit-remaining'),
        reset: headers.get('x-ratelimit-reset')
      }

      if (ratelimit.remaining < ratelimit.limit / 10) {
        if (ratelimit.remaining > 0) {
          console.warn(`Near GitHub GraphQL Rate Limit: ${ratelimit.remaining} request(s) left`)
          debug('limits', {
            ...ratelimit,
            resetDate: new Date(ratelimit.reset * 1000).toString()
          })
        } else {
          console.error(`GitHub GraphQL Error: Rate Limit reached. Reset at ${new Date(ratelimit.reset * 1000).toString()}.`)
        }
      }

      next()
    })
  }

  githubApolloFetch.useAfter(({ response }, next) => {
    if (response && response.parsed && response.parsed.errors) {
      const errors = response.parsed.errors
      throw new Error(JSON.stringify(errors))
    }
    next()
  })

  const githubRest = new GitHubApi({
    previews: ['machine-man-preview', 'mercy-preview'],
    auth: installationToken.token
  })

  if (GITHUB_LOG_RATELIMIT) {
    const now = new Date().getTime()
    if (!nextRateLimitCheck || nextRateLimitCheck <= now) {
      nextRateLimitCheck = now + 15 * 60 * 1000
      githubRest.rateLimit.get()
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
              console.log(util.inspect(message, null, { depth: null }))
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
