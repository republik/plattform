const twitter = require('./twitter')
const vimeo = require('./vimeo')
const youtube = require('./youtube')
const linkPreview = require('./linkPreview')

module.exports = {
  documentcloud: require('./documentcloud'),
  twitter,
  vimeo,
  youtube,
  linkPreview,
  ...require('./fetchAndStore'),
  imageKeys: [...new Set([
    ...twitter.imageKeys,
    ...vimeo.imageKeys,
    ...youtube.imageKeys,
    ...linkPreview.imageKeys
  ])]
}
