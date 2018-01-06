const { createGithubClients } = require('../../lib/github')
const MDAST = require('@orbiting/remark-preset')
const { createPrefixUrl } = require('../../lib/assets')
const visit = require('unist-util-visit')
const debug = require('debug')('publikator:commit')

module.exports = {
  document: async (
    {
      id: commitId,
      repo: { id: repoId },
      document: existingDocument
    },
    { oneway },
    { user, redis }
  ) => {
    try {
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

        mdast = MDAST.parse(repository.blob.text)
        await redis.setAsync(redisKey, JSON.stringify(mdast))
      }

      // prefix image urls
      // - editor specific
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
        content: mdast
      }
    } catch (e) {
      console.error(e)
      return {
        content: {
          document: null,
          meta: null
        }
      }
    }
  }
}
