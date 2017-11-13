const fetch = require('isomorphic-unfetch')

const {
  YOUTUBE_APP_KEY
} = process.env

if (!YOUTUBE_APP_KEY) { console.warn('missing YOUTUBE_APP_KEY. Youtube Embeds won\'t work.') }

const getYoutubeVideoById = async id => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${YOUTUBE_APP_KEY}&part=snippet`,
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

  return {
    id: response.items[0].id,
    createdAt: response.items[0].snippet.publishedAt,
    userId: response.items[0].snippet.channelId,
    userName: response.items[0].snippet.channelTitle,
    thumbnail: response.items[0].snippet.thumbnails.standard.url
  }
}

module.exports = {
  getYoutubeVideoById
}
