const redis = require('@orbiting/backend-modules-base/lib/redis')

// TODO require from servers is not the idea in packages
const getRepos = require('../../../../servers/publikator/graphql/resolvers/_queries/repos')
const {
  latestPublications: getLatestPublications,
  meta: getRepoMeta
} = require('../../../../servers/publikator/graphql/resolvers/Repo')
const { upsert: repoCacheUpsert } = require('../../../../servers/publikator/lib/cache/upsert')

const iterateRepos = async (context, callback) => {
  let pageInfo
  let pageCounter = 1

  do {
    console.info(`requesting repos (page ${pageCounter}) ...`)
    pageCounter += 1

    const repos = await getRepos(null, {
      first: 20,
      ...(pageInfo && pageInfo.hasNextPage)
        ? { after: pageInfo.endCursor }
        : { }
    }, context)

    pageInfo = repos.pageInfo

    for (let repo of repos.nodes) {
      await callback(
        repo,
        await getRepoMeta(repo),
        await getLatestPublications(repo)
      )
    }
  } while (pageInfo && pageInfo.hasNextPage)
}

module.exports = {
  before: () => {},
  insert: async ({indexName, type: indexType, elastic, pgdb}) => {
    const stats = { [indexType]: { added: 0, total: 0 } }
    const statsInterval = setInterval(
      () => { console.log(indexName, stats) },
      1 * 1000
    )

    const context = {
      redis,
      pgdb,
      user: {
        name: 'publikator-pullelasticsearch',
        email: 'ruggedly@republik.ch',
        roles: [ 'editor' ]
      }
    }

    await iterateRepos(context, async (repo, repoMeta, publications) => {
      if (repoMeta && repoMeta.mailchimpCampaignId) {
        await redis.setAsync(
          `repos:${repo.id}/mailchimp/campaignId`,
          repoMeta.mailchimpCampaignId,
          'EX', redis.__defaultExpireSeconds
        )
      }

      stats[indexType].total++
      stats[indexType].added++

      await repoCacheUpsert({
        commit: repo.latestCommit,
        content: repo.latestCommit.document.content,
        id: repo.id,
        meta: repo.meta,
        publications,
        tags: repo.tags
      })
    })

    clearInterval(statsInterval)

    console.log(indexName, stats)
  },
  after: () => {}
}
