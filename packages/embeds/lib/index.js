const uniq = require('lodash/uniq')

const twitter = require('./twitter')
const vimeo = require('./vimeo')
const youtube = require('./youtube')

module.exports = {
  documentcloud: require('./documentcloud'),
  twitter,
  vimeo,
  youtube,
  imageKeys: uniq([
    ...twitter.imageKeys,
    ...vimeo.imageKeys,
    ...youtube.imageKeys
  ])
}
