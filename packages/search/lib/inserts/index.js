const dict = {
  comment: require('./comment'),
  document: require('./document'),
  documentzone: require('./documentzone'),
  repo: require('./repo'),
  user: require('./user'),
}

const list = []

for (const key in dict) {
  list.push(dict[key])
}

module.exports = {
  dict,
  list,
}
