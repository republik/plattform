const { createGithubClients } = require('../../lib/github')
const MDAST = require('@orbiting/remark-preset')
const {
  lib: {
    createRepoUrlPrefixer,
    createUrlPrefixer
  }
} = require('@orbiting/backend-modules-assets')
const {
  lib: {
    process: {
      processRepoImageUrlsInContent,
      processRepoImageUrlsInMeta,
      processImageUrlsInContent
    }
  }
} = require('@orbiting/backend-modules-documents')
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
    redis.expireAsync(redisKey, redis.__defaultExpireSeconds)
    if (redisMdast) {
      debug('document: redis HIT (%s)', redisKey)
      mdast = JSON.parse(redisMdast)
    } else {
      debug('document: redis MISS (%s)', redisKey)
      const { githubApolloFetch, githubRest } = await createGithubClients()
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
                  oid
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

      const blobParams = {
        owner: login,
        repo: repoName,
        file_sha: repository.blob.oid
      }

      let blobResult, error
      try {
        blobResult = await githubRest.git.getBlob(blobParams)
      } catch (e) {
        error = e
        blobResult = null
      }

      if (error || !blobResult || !blobResult.data || !blobResult.data.content) {
        console.error(
          'getBlob failed for ',
          { ...blobParams, commitId, error }
        )
        throw new Error(`getBlob failed for sha ${repository.blob.oid}`)
      }

      try {
        mdast = MDAST.parse(Buffer.from(blobResult.data.content, 'base64').toString('utf8'))
      } catch (e) {
        console.error(e)
      }
      if (mdast) {
        await redis.setAsync(redisKey, JSON.stringify(mdast), 'EX', redis.__defaultExpireSeconds)
      } else {
        mdast = MDAST.parse('Dokument fehlerhaft. Reden Sie mit der IT.')
      }
    }

    // prefix repo image's urls
    const repoImagePaths = []
    const prefixRepoUrl = createRepoUrlPrefixer(repoId, publicAssets, repoImagePaths)
    processRepoImageUrlsInContent(mdast, prefixRepoUrl)
    processRepoImageUrlsInMeta(mdast, prefixRepoUrl)

    // prefix embed image's urls
    const prefixUrl = createUrlPrefixer(publicAssets)
    processImageUrlsInContent(mdast, prefixUrl)

    return {
      id: Buffer.from(`repo:${repoId}:${commitId}`).toString('base64'),
      repoId,
      content: mdast,
      repoImagePaths
    }
  }
}
