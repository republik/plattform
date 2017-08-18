const fetch = require('isomorphic-unfetch')
const { createApolloFetch } = require('apollo-fetch')

const GITHUB_GRAPHQL_API_URL = 'https://api.github.com/graphql'

module.exports = {
  createGithubFetchForUser (user) {
    return createApolloFetch({
      uri: GITHUB_GRAPHQL_API_URL
    }).use(({ request, options }, ghNext) => {
      if (!options.headers) {
        options.headers = {}
      }
      options.headers['Authorization'] = `Bearer ${user.githubAccessToken}`
      ghNext()
    })
  },
  async commit (token, owner, repo, parents, tree, message) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message,
        tree,
        parents
      })
    })

    return response.json()
  }
}
