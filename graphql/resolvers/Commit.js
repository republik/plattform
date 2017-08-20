const { createGithubFetchForUser } = require('../../lib/github')

module.exports = {
  document: async (commit, args, { user }) => {
    const query = `
      query document(
        $login: String!,
        $repoName: String!,
        $blobExpression: String!
      ) {
        repository(owner: $login, name: $repoName) {
          blob: object(expression: $blobExpression) {
            ... on Blob {
              text
            }
          }
        }
      }
    `

    const [login, repoName] = commit.repo.id.split('/')
    const variables = {
      login,
      repoName,
      blobExpression: `${commit.id}:article.json`
    }

    const {
      errors,
      data: {
        repository
      }
    } = await createGithubFetchForUser(user)({ query, variables })
    if (errors) {
      throw new Error(JSON.stringify(errors))
    }

    if (!repository.blob) {
      throw new Error('no document found for: ' + variables.blobExpression)
    }

    return {
      encoding: 'UTF-8',
      content: repository.blob.text,
      commit
    }
  }
}
