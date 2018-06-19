const { graphql: { resolvers: { queries: { document: getDocument } } } } =
  require('@orbiting/backend-modules-documents')

const MilestoneInterface = require('./MilestoneInterface')

module.exports = {
  ...MilestoneInterface,
  prepublication: ({ name }) =>
    name.indexOf('prepublication') > -1,

  // default values in meta are set in resolvers
  scheduledAt: ({ meta: { scheduledAt } }) => scheduledAt,
  updateMailchimp: ({ meta: { updateMailchimp } }) => updateMailchimp,

  // Retrieve documents attached to a publication
  document: async (__, args, context) => {
    const {
      name: versionName,
      document: doc,
      repo: {
        id: repoId
      }
    } = __

    if (doc) { // publish mutation
      return doc
    }

    return getDocument(__, { repoId, versionName }, context)
  }
}
