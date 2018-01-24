const { createGithubClients } = require('../../lib/github')
const MDAST = require('@orbiting/remark-preset')
const { lib: {
  createRepoUrlPrefixer,
  createUrlPrefixer
} } = require('@orbiting/backend-modules-assets')
const { lib: { process: {
  processRepoImageUrls,
  processImageUrls
} } } = require('@orbiting/backend-modules-documents')
const debug = require('debug')('publikator:commit')

module.exports = {
  document: async (
    {
      id: commitId,
      repo: { id: repoId },
      document: existingDocument
    },
    { publicAssets = false },
    { user, redis }
  ) => {
    if (existingDocument) {
      return existingDocument
    }

    let mdast

    const redisKey = `repos:${repoId}/commits/${commitId}/document/mdast`
    const redisMdast = await redis.getAsync(redisKey)
    if (redisMdast) {
      debug('document: redis HIT (%s)', redisKey)
      mdast = JSON.parse(redisMdast)
    } else {
      debug('document: redis MISS (%s)', redisKey)
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
        console.warn(`no document found for ${repoId}`)
        return {
          content: {},
          meta: {}
        }
      }

      try {
        mdast = MDAST.parse(repository.blob.text)
      } catch (e) {
        console.error(e)
      }
      if (mdast) {
        await redis.setAsync(redisKey, JSON.stringify(mdast))
      } else {
        mdast = MDAST.parse('Dokument fehlerhaft. Reden Sie mit der IT.')
      }
    }

    // prefix repo image's urls
    const prefixRepoUrl = createRepoUrlPrefixer(repoId, publicAssets)
    processRepoImageUrls(mdast, prefixRepoUrl)

    // prefix embed image's urls
    const prefixUrl = createUrlPrefixer(publicAssets)
    processImageUrls(mdast, prefixUrl)

    return {
      id: Buffer.from(`repo:${repoId}:${commitId}`).toString('base64'),
      repoId,
      content: mdast
    }
  }
}
