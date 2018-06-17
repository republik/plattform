const MilestoneInterface = require('./MilestoneInterface')
const debug = require('debug')('publikator:graphql:resolvers:Publication')

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
      debug({ repoId, refName, doc })
      return doc
    }
    /*
     @TODO This is broken. We do not add information Redis anymore. Can
     maybe be retrieved from ElasticSearhc, but "refName" is not available
     there, would have to be deduced. (pae)
    */
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
