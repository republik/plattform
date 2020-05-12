const sortKeyMap = {
  'DATE': 'createdAt',
  'VOTES': 'score',
  'HOT': 'hotness',
  'REPLIES': 'totalRepliesCount',
  'FEATURED_AT': 'featuredAt'
}

// never return key unfiltered here as this would
// enable SQL injections
module.exports = (key) => sortKeyMap[key]
