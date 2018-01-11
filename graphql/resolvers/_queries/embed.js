const { Roles: { ensureUserHasRole } } = require('@orbiting/backend-modules-auth')
const { getTweetById } = require('../../../lib/embeds/twitter')
const { getYoutubeVideoById } = require('../../../lib/embeds/youtube')
const { getVimeoVideoById } = require('../../../lib/embeds/vimeo')

// // One capturing group at match[1] that catches the status
// const TWITTER_REGEX = /^https?:\/\/twitter\.com\/(?:#!\/)?\w+\/status(?:es)?\/(\d+)$/
//
// // One capturing group at match[1] that catches the video id
// const YOUTUBE_REGEX = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*$/
//
// // One capturing group at match[1] that catches the video id
// const VIMEO_REGEX = /^(?:http|https)?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|)(\d+)(?:|\/\?)$/

module.exports = async (_, args, { user, t }) => {
  ensureUserHasRole(user, 'editor')

  const { id, embedType } = args

  if (embedType === 'TwitterEmbed') {
    const tweetData = await getTweetById(id, t)

    return {
      embedType,
      ...tweetData
    }
  }
  if (embedType === 'YoutubeEmbed') {
    const youtubeData = await getYoutubeVideoById(id)

    return {
      embedType,
      ...youtubeData
    }
  }

  if (embedType === 'VimeoEmbed') {
    const vimeoData = await getVimeoVideoById(id)

    return {
      embedType,
      id,
      ...vimeoData
    }
  }

  throw new Error(`Cannot match ID ${id} of embed type ${embedType}`)
}
