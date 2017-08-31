const { createGithubFetchForUser } = require('../../lib/github')
const MDAST = require('../../lib/mdast/mdast')
const visit = require('unist-util-visit')

const { PUBLIC_ASSETS_URL } = process.env

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
      blobExpression: `${commit.id}:article.md`
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

    const mdast = MDAST.parse(repository.blob.text)

    // prefix image urls
    const prefixImages = (node) => {
      if (node.url && node.url.indexOf('images/') === 0) {
        node.url = `${PUBLIC_ASSETS_URL}/${commit.repo.id}/${commit.id}/${node.url}`
      }
    }
    visit(mdast, 'image', prefixImages)

    return {
      content: JSON.stringify(mdast),
      commit
    }
  }
}
