const { createGithubFetchForUser } = require('../../../lib/github')
const { GITHUB_LOGIN } = process.env

module.exports = async (_, args, {user}) => {
  const {first} = args

  const query = `
    query repositories($login: String!, $first: Int!) {
      repositoryOwner(login: $login) {
        repositories(first: $first) {
          nodes {
            name
          }
        }
      }
    }
  `
  const variables = {
    login: GITHUB_LOGIN,
    first
  }

  const {
    errors,
    data: {
      repositoryOwner: {
        repositories: {
          nodes: repositories
        }
      }
    }
  } = await createGithubFetchForUser(user)({ query, variables })
  if (errors) {
    throw new Error(JSON.stringify(errors))
  }

  return repositories.map(repo => ({
    id: `${GITHUB_LOGIN}/${repo.name}`
  }))
}
