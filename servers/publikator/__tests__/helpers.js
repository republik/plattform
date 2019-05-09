const Promise = require('bluebird')

const deleteRepos = async () => {
  // this is hardcoded to never accidentally drain the wrong org
  const ORG = 'orbiting-test'

  const { GITHUB_LOGIN } = process.env
  if (process.env.GITHUB_LOGIN !== ORG) {
    throw new Error(
      `deleteRepos: env.GITHUB_LOGIN ('${GITHUB_LOGIN}') doesn't equal hardcoded value: '${ORG}' abort!`
    )
  }

  const { createGithubClients } = require('../lib/github')
  const { githubRest } = await createGithubClients()

  let hadMore = false
  let page = 0
  do {
    const response = await githubRest.repos.listForOrg({
      org: ORG,
      sort: 'created',
      direction: 'desc',
      per_page: 100,
      page
    })
    page++

    if (!response || !response.data) {
      throw new Error('deleteRepos error getting repos', { response })
    }

    const repoNames = response.data
      .map(r => r.name)

    hadMore = repoNames.length > 0
    if (hadMore) {
      await Promise.map(
        repoNames,
        repo => {
          console.log(`deleting: ${repo}...`)
          return githubRest.repos.delete({
            owner: ORG,
            repo
          })
        },
        { concurrency: 5 }
      )
    }
  } while (hadMore)
  console.log('deleteRepos: all repos deleted.')
}

const getArticleMdFromGithub = async (repoId) => {
  const { createGithubClients } = require('../lib/github')
  const { githubRest } = await createGithubClients()

  const [owner, repo] = repoId.split('/')

  return githubRest.repos.getContents({
    owner,
    repo,
    path: 'article.md'
  })
    .then(({ data: { content, encoding } }) =>
      Buffer.from(content, encoding).toString('utf-8')
    )
    .catch(response => null)
}

module.exports = {
  deleteRepos,
  getArticleMdFromGithub
}
