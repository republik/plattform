const { ensureUserHasRole } = require('../../../lib/Roles')
const { descending } = require('d3-array')
const yaml = require('js-yaml')
const {
  githubRest,
  getAllReleases,
  publicationNormalizer
} = require('../../../lib/github')

// TODO updateMailchimp
module.exports = async (
  _,
  { repoId, commitId, prepublication, scheduledAt, updateMailchimp = false },
  { user, redis }
) => {
  ensureUserHasRole(user, 'editor')

  const versionRegex = /^v(\d+).*/

  const latestReleaseNumber = await getAllReleases(repoId)
    .then(releases => releases
      .filter(release => versionRegex.test(release.name))
      .map(release => parseInt(versionRegex.exec(release.name)[1]))
      .sort((a, b) => descending(a, b))
      .shift()
    )

  const versionNumber = latestReleaseNumber
    ? latestReleaseNumber + 1
    : 1

  const versionName = prepublication
    ? `v${versionNumber}-prepublication`
    : `v${versionNumber}`

  const [login, repoName] = repoId.split('/')
  const release = await githubRest.repos.createRelease({
    owner: login,
    repo: repoName,
    target_commitish: commitId,
    tag_name: versionName,
    name: versionName,
    body: yaml.safeDump(
      scheduledAt
        ? { scheduledAt, updateMailchimp }
        : { updateMailchimp }
    ),
    draft: false,
    prerelease: prepublication // only for indication on github
  })
    .then(response => response.data)

  return publicationNormalizer({
    ...release,
    repo: {
      id: repoId
    }
  })
}
