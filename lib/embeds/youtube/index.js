const fetch = require('isomorphic-unfetch')

const { YOUTUBE_APP_KEY } = process.env

if (!YOUTUBE_APP_KEY) {
  console.warn("missing YOUTUBE_APP_KEY. Youtube Embeds won't work.")
}

const getYoutubeVideoById = async id => {
  // Note that player.embedWidth/embedHeight is only returned if the request
  // specifies a maxWidth parameter.
  // https://developers.google.com/youtube/v3/docs/videos
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${YOUTUBE_APP_KEY}&part=snippet,player&maxWidth=1000`,
    {
      method: 'GET'
    }
  )
    .then(res => res.json())
    .catch(error => {
      console.error(`Error getting Youtube video with id ${id}:`, error)
      return error
    })

  if (response.pageInfo.totalResults < 1) {
    throw new Error(`Youtube API Error: No video found with ID ${id}.`)
  }

  const channelId = response.items[0].snippet.channelId
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&key=${YOUTUBE_APP_KEY}&part=snippet`,
    {
      method: 'GET'
    }
  )
    .then(res => res.json())
    .catch(error => {
      console.error(`Error getting Youtube channel with id ${id}:`, error)
      return error
    })

  return {
    platform: 'youtube',
    id: response.items[0].id,
    createdAt: new Date(response.items[0].snippet.publishedAt),
    retrievedAt: new Date(),
    title: response.items[0].snippet.title,
    userUrl: `https://www.youtube.com/channel/${channelId}`,
    userName: response.items[0].snippet.channelTitle,
    thumbnail: response.items[0].snippet.thumbnails.maxres.url,
    userProfileImageUrl: channelResponse
      ? channelResponse.items[0].snippet.thumbnails.default.url
      : '',
    aspectRatio:
      response.items[0].player.embedWidth / response.items[0].player.embedHeight
  }
}

module.exports = {
  getYoutubeVideoById,
  // manually keep in sync with backend-modules/packages/documents/lib/process.js
  // until embeds are in their own module
  imageKeys: ['thumbnail', 'userProfileImageUrl']
}
