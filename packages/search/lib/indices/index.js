const dict = {
  comments: require('./comments'),
  documents: require('./documents'),
  documentzones: require('./documentzones'),
  users: require('./users'),
  repos: require('./repos'),
}

const list = []

for (const key in dict) {
  list.push(dict[key])
}

module.exports = {
  dict,
  list,
}
