const debug = require('debug')('publikator:publication')

const { graphql: { resolvers: { queries: { document: getDocument } } } } =
  require('@orbiting/backend-modules-documents')

const { getDocumentId } =
  require('@orbiting/backend-modules-search/lib/Documents')

const MilestoneInterface = require('./MilestoneInterface')

module.exports = {
  ...MilestoneInterface,
  prepublication: ({ name }) =>
    name.indexOf('prepublication') > -1,

  // default values in meta are set in resolvers
  scheduledAt: ({ meta: { scheduledAt } }) => scheduledAt,
  updateMailchimp: ({ meta: { updateMailchimp } }) => updateMailchimp,

  document: async (publication, args, context) => {
    const {
      document: doc,
      repo: {
        id: repoId
      },
      commit: {
        id: commitId
      },
      name: versionName
    } = publication

    if (doc) {
      return doc
    }

    debug(
      'necessary to fetch Document',
      { repoId, commitId, versionName }
    )

    return getDocument(
      null,
      { id: getDocumentId({ repoId, commitId, versionName }) },
      context
    )
  }
}
