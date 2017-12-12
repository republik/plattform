const { createGithubClients } = require('../../lib/github')
const MDAST = require('@orbiting/remark-preset')
const { createPrefixUrl } = require('../../lib/assets')
const visit = require('unist-util-visit')
const { timeParse } = require('d3-time-format')
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
    const prefixUrl = createPrefixUrl(repoId, oneway)
    visit(mdast, 'image', node => {
      node.url = prefixUrl(node.url)
    })
    Object.keys(mdast.meta).forEach(key => {
      if (key.match(/image/i)) {
        mdast.meta[key] = prefixUrl(mdast.meta[key])
      }
    })

    let credits
    visit(mdast, 'zone', node => {
      if (node.identifier === 'TITLE') {
        const ps = node.children.filter(child => child.type === 'paragraph')
        if (ps.length >= 2) {
          credits = ps[ps.length - 1].children
        }
      }
    })

    // TODO remove when editor sends a real date for meta.publishDate
    const parsePublishDate = timeParse('%d.%m.%Y %H:%M')
    const publishDate = mdast.meta.publishDate
      ? parsePublishDate(mdast.meta.publishDate) || mdast.meta.publishDate
      : null

    return {
      content: mdast,
      meta: {
        ...mdast.meta,
        credits,
        publishDate
      }
    }
  }
}
