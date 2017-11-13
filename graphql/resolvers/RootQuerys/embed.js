const { ensureUserHasRole } = require('../../../lib/Roles')
const { getTweetById } = require('../../../lib/twitter')
const { getYoutubeVideoById } = require('../../../lib/youtube')
const { getVimeoVideoById } = require('../../../lib/vimeo')

const TWITTER_REGEX = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/
const YOUTUBE_REGEX = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/
const VIMEO_REGEX = /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|)(\d+)(?:|\/\?)/

module.exports = async (_, args, { user }) => {
  ensureUserHasRole(user, 'editor')

  const { url } = args

  if (TWITTER_REGEX.test(url)) {
    const tweetId = TWITTER_REGEX.exec(url)[3]
    const tweetData = await getTweetById(tweetId)

    return {
      embedType: 'Twitter',
      url,
      ...tweetData
    }
  }
  if (YOUTUBE_REGEX.test(url)) {
    const youtubeId = YOUTUBE_REGEX.exec(url)[1]
    const youtubeData = await getYoutubeVideoById(youtubeId)

    return {
      embedType: 'Youtube',
      url,
      ...youtubeData
    }
  }

  if (VIMEO_REGEX.test(url)) {
    const vimeoId = VIMEO_REGEX.exec(url)[4]
    console.log(VIMEO_REGEX.exec(url))
    const vimeoData = await getVimeoVideoById(vimeoId)

    return {
      embedType: 'Vimeo',
      url,
      id: vimeoId,
      ...vimeoData
    }
  }

  throw new Error(`Cannot match URL ${url}`)
}
