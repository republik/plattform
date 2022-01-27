module.exports = {
  Credential: require('./Credential'),
  Discussion: require('./Discussion'),
  hotness: require('./hotness'),
  Notifications: require('./Notifications'),
  ...require('./discussionPreferences'),
  slack: require('./slack'),
  sortKey: require('./sortKey'),
  voteComment: require('./voteComment'),
  stats: {
    evolution: require('./stats/evolution'),
  },
}
