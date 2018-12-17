const sortKeyMap = {
  'DATE': 'createdAt',
  'VOTES': 'score',
  'HOT': 'hotness',
  'REPLIES': 'totalRepliesCount'
}

module.exports = (key) => sortKeyMap[key]
