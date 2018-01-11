const uniq = require('lodash/uniq')

module.exports = {
  imageKeys: uniq([
    ...require('./twitter').imageKeys,
    ...require('./vimeo').imageKeys,
    ...require('./youtube').imageKeys
  ])
}
