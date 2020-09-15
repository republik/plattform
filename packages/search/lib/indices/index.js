const dict = {
  comments: require('./comments'),
  documents: require('./documents'),
  users: require('./users'),
  repos: require('./repos'),
}

const list = []

for (let key in dict) {
  list.push(dict[key])
}

module.exports = {
  dict,
  list,
}
