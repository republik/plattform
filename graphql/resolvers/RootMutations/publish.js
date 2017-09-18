const { ensureUserHasRole } = require('../../../lib/Roles')
const { descending } = require('d3-array')
const yaml = require('js-yaml')
const omitBy = require('lodash/omitBy')
const isNil = require('lodash/isNil')
const {
  githubRest,
  getAnnotatedTags,
  publicationVersionRegex
} = require('../../../lib/github')

const placeMilestone = require('./placeMilestone')

// TODO updateMailchimp
module.exports = async (
  _,
  { repoId, commitId, prepublication, scheduledAt, updateMailchimp = false },
  { user, t }
) => {
  ensureUserHasRole(user, 'editor')

  const latestPublicationVersion = await getAnnotatedTags(repoId)
    .then(tags => tags
      .filter(tag => publicationVersionRegex.test(tag.name))
      .map(tag => parseInt(publicationVersionRegex.exec(tag.name)[1]))
      .sort((a, b) => descending(a, b))
      .shift()
    )

  const versionNumber = latestPublicationVersion
    ? latestPublicationVersion + 1
    : 1

  const versionName = prepublication
    ? `v${versionNumber}-prepublication`
    : `v${versionNumber}`

  const message =
`---
${yaml.safeDump(
  omitBy({
    scheduledAt,
    updateMailchimp
  }, isNil)
)}
---

${t('api/github/yaml/warning')}
`

  const milestone = await placeMilestone(
    null,
    {
      repoId,
      commitId,
      name: versionName,
      message
    },
    {
      user
    }
  )

  const [login, repoName] = repoId.split('/')

  // only for indication on github
  await githubRest.repos.createRelease({
    owner: login,
    repo: repoName,
    tag_name: milestone.name,
    name: versionName,
    draft: false,
    prerelease: prepublication
  })
    .then(response => response.data)

  return {
    ...milestone,
    meta: {
      scheduledAt,
      updateMailchimp
    }
  }
}
