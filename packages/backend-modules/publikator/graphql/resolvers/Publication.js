// const debug = require('debug')('publikator:publication')

const MilestoneInterface = require('./MilestoneInterface')

module.exports = {
  ...MilestoneInterface,
  live: (publication) => !!(publication.publishedAt && !publication.revokedAt),
  prepublication: (publication) => publication.scope === 'prepublication',
  updateMailchimp: (publication) => !!publication.meta?.updateMailchimp,
  sha: (publication) => publication.id,
}
