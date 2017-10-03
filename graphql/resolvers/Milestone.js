const {
  publicationVersionRegex
} = require('../../lib/github')

const MilestoneInterface = require('./MilestoneInterface')

module.exports = {
  ...MilestoneInterface,
  immutable: async (milestone, args, { user }) =>
    publicationVersionRegex.test(milestone.name)
}
