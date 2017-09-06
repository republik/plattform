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
    const prefixUrl = url => url && url.indexOf('images/') === 0
      ? `${PUBLIC_ASSETS_URL}/${commit.repo.id}/${commit.id}/${url}`
      : url

    visit(mdast, 'image', node => {
      node.url = prefixUrl(node.url)
    })
    Object.keys(mdast.meta).forEach(key => {
      if (key.match(/image/i)) {
        mdast.meta[key] = prefixUrl(mdast.meta[key])
      }
    })

    return {
      mdast,
      content: JSON.stringify(mdast),
      commit
    }
  }
}
