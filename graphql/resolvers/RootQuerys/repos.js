const { githubApolloFetch } = require('../../../lib/github')
const { ensureUserHasRole } = require('../../../lib/Roles')
const { GITHUB_LOGIN } = process.env

module.exports = async (_, args, {user}) => {
  ensureUserHasRole(user, 'editor')

  const { first } = args

  const {
    data: {
      repositoryOwner: {
        repositories: {
          nodes: repositories
        }
      }
    }
  } = await githubApolloFetch({
    query: `
      query repositories(
        $login: String!,
        $first: Int!
      ) {
        repositoryOwner(login: $login) {
          repositories(first: $first) {
            nodes {
              name
            }
          }
        }
      }
    `,
    variables: {
      login: GITHUB_LOGIN,
      first
    }
  })

  return repositories.map(repo => ({
    id: `${GITHUB_LOGIN}/${repo.name}`
  }))
}
