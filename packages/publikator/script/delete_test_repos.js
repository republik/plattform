require('@orbiting/backend-modules-env').config('.test.env')

const {
  createGithubClients
} = require('../lib/github')

const org = 'republik-dev'

Promise.resolve().then(async () => {
  const { githubRest } = await createGithubClients()

  const response = await githubRest.search.repos({
    q: `org:${org} in:name test-`,
    per_page: 100
  })

  const testRepoNames = response.data.items
    .filter(r => new RegExp(/^test-\d{13}-/).test(r.name))
    .map(r => r.name)

  for (let repoName of testRepoNames) {
    console.log(`deleting ${repoName}...`)
    await githubRest.repos.delete({
      owner: org,
      repo: repoName
    })
  }

  console.log('done!')
})
  .then(() => { process.exit() })
  .catch(e => {
    console.log(e)
    process.exit(1)
  })
