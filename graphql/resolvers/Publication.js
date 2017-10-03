const MilestoneInterface = require('./MilestoneInterface')

module.exports = {
  ...MilestoneInterface,
  prepublication: ({ name }) =>
    name.indexOf('prepublication') > -1,

  // default values in meta are set in resolvers
  scheduledAt: ({ meta: { scheduledAt } }) => scheduledAt,
  updateMailchimp: ({ meta: { updateMailchimp } }) => updateMailchimp
}
