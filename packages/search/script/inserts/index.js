const dict = {
  comment: require('./comment'),
  document: require('./document'),
  user: require('./user')
}

const list = []

for (let key in dict) {
  list.push(dict[key])
}

module.exports = {
  dict,
  list
}
