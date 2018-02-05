const MilestoneInterface = require('./MilestoneInterface')

module.exports = {
  ...MilestoneInterface,
  prepublication: ({ name }) =>
    name.indexOf('prepublication') > -1,

  // default values in meta are set in resolvers
  scheduledAt: ({ meta: { scheduledAt } }) => scheduledAt,
  updateMailchimp: ({ meta: { updateMailchimp } }) => updateMailchimp,

  document: ({
    document: doc,
    repo: {
      id: repoId
    },
    refName
  }, args, { redis }) => {
    if (doc) { // publish mutation
      return doc
    }
    return redis.getAsync(`repos:${repoId}/${refName}`)
      .then(publication => {
        const json = JSON.parse(publication)
        if (!json) {
          return null
        }
        return json.doc
      })
  }
}
