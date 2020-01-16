const uniq = require('lodash/uniq')

const twitter = require('./twitter')
const vimeo = require('./vimeo')
const youtube = require('./youtube')

module.exports = {
  imageKeys: uniq([
    ...require('./twitter').imageKeys,
    ...require('./vimeo').imageKeys,
    ...require('./youtube').imageKeys
  ]),
  documentcloud: require('./documentcloud'),
  twitter,
  vimeo,
  youtube
}
