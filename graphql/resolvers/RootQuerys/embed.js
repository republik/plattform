const { ensureUserHasRole } = require('../../../lib/Roles')
const { getTweetById } = require('../../../lib/twitter')
const { getYoutubeVideoById } = require('../../../lib/youtube')
const { getVimeoVideoById } = require('../../../lib/vimeo')

// One capturing group at match[1] that catches the status
const TWITTER_REGEX = /^https?:\/\/twitter\.com\/(?:#!\/)?\w+\/status(?:es)?\/(\d+)$/

// One capturing group at match[1] that catches the video id
const YOUTUBE_REGEX = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*$/

// One capturing group at match[1] that catches the video id
const VIMEO_REGEX = /^(?:http|https)?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|)(\d+)(?:|\/\?)$/

module.exports = async (_, args, { user }) => {
  ensureUserHasRole(user, 'editor')

  const { url } = args

  if (TWITTER_REGEX.test(url)) {
    const tweetId = TWITTER_REGEX.exec(url)[1]
    const tweetData = await getTweetById(tweetId)

    return {
      embedType: 'TwitterEmbed',
      url,
      ...tweetData
    }
  }
  if (YOUTUBE_REGEX.test(url)) {
    const youtubeId = YOUTUBE_REGEX.exec(url)[1]
    const youtubeData = await getYoutubeVideoById(youtubeId)

    return {
      embedType: 'YoutubeEmbed',
      url,
      ...youtubeData
    }
  }

  if (VIMEO_REGEX.test(url)) {
    const vimeoId = VIMEO_REGEX.exec(url)[1]
    const vimeoData = await getVimeoVideoById(vimeoId)

    return {
      embedType: 'VimeoEmbed',
      url,
      id: vimeoId,
      ...vimeoData
    }
  }

  throw new Error(`Cannot match URL ${url}`)
}
