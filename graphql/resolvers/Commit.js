const { createGithubClients } = require('../../lib/github')
const MDAST = require('../../lib/mdast/mdast')
const { createPrefixUrl } = require('../../lib/assets')
const visit = require('unist-util-visit')

module.exports = {
  document: async ({ id: commitId, repo: { id: repoId } }, { oneway }, { user }) => {
    const { githubApolloFetch } = await createGithubClients()
    const [login, repoName] = repoId.split('/')

    const {
      data: {
        repository
      }
    } = await githubApolloFetch({
      query: `
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
      `,
      variables: {
        login,
        repoName,
        blobExpression: `${commitId}:article.md`
      }
    })

    if (!repository.blob) {
      throw new Error('no document found')
    }

    const mdast = MDAST.parse(repository.blob.text)

    // prefix image urls
    const prefixUrl = createPrefixUrl(repoId, oneway)
    visit(mdast, 'image', node => {
      node.url = prefixUrl(node.url)
    })
    Object.keys(mdast.meta).forEach(key => {
      if (key.match(/image/i)) {
        mdast.meta[key] = prefixUrl(mdast.meta[key])
      }
    })

    return {
      content: mdast,
      meta: mdast.meta
    }
  }
}
