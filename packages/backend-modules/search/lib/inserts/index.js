const dict = {
  comment: require('./comment'),
  document: require('./document'),
  documentzone: require('./documentzone'),
  mail: require('./mail'),
  questionnairesubmission: require('./questionnairesubmission'),
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
