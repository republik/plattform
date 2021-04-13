const { toCommit } = require('../../lib/postgres')

module.exports = {
  commit({ commit }) {
    if (!commit) {
      return null
    }

    return toCommit(commit)
  },
}
