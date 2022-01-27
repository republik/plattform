// const debug = require('debug')('publikator:publication')

const {
  getDocumentId,
} = require('@orbiting/backend-modules-search/lib/Documents')

const MilestoneInterface = require('./MilestoneInterface')

module.exports = {
  ...MilestoneInterface,
  document: async (publication, args, context) => {
    const { repoId, commitId, name: versionName } = publication

    return context.loaders.Document.byId.load(
      getDocumentId({ repoId, commitId, versionName }),
    )
  },
  live: (publication) => !!(publication.publishedAt && !publication.revokedAt),
  prepublication: (publication) => publication.scope === 'prepublication',
  updateMailchimp: (publication) => !!publication.meta?.updateMailchimp,
  sha: (publication) => publication.id,
}
