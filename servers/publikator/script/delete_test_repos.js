process.env.OVERWRITE_ENV = '.test.env'
require('@orbiting/backend-modules-env').config()

const {
  createGithubClients
} = require('../lib/github')

Promise.resolve().then(async () => {
  const { githubRest } = await createGithubClients()

  const response = await githubRest.search.repos({
    q: 'org:orbiting-test test-',
    per_page: 100
  })

  const testRepoNames = response.data.items
    .filter(r => new RegExp(/^test-/).test(r.name))
    .map(r => r.name)

  for (let repoName of testRepoNames) {
    await githubRest.repos.delete({
      owner: 'orbiting-test',
      repo: repoName
    })
  }
  console.log('done!')
})
.then(() => {
  process.exit()
})
.catch(e => {
  console.log(e)
  process.exit(1)
})
