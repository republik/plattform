const twitter = require('./twitter')
const vimeo = require('./vimeo')
const youtube = require('./youtube')

module.exports = {
  documentcloud: require('./documentcloud'),
  linkPreview: require('./linkPreview'),
  twitter,
  vimeo,
  youtube,
  imageKeys: [...new Set([
    ...twitter.imageKeys,
    ...vimeo.imageKeys,
    ...youtube.imageKeys
  ])]
}
