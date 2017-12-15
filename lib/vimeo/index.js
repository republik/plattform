const fetch = require('isomorphic-unfetch')
const oauth = require('./oauth')

let bearerToken

const getVimeoVideoById = async id => {
  if (!bearerToken) {
    bearerToken = await oauth()
  }

  const response = await fetch(`https://api.vimeo.com/videos/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Accept-Encoding': 'gzip'
    }
  })
    .then(res => res.json())
    .catch(error => {
      console.error(`Error getting Vimeo video with id ${id}:`, error)
      return error
    })

  if (response.error) {
    throw new Error(`Vimeo API Error: ${response.error}.`)
  }

  const mp4 =
    response.files &&
    response.files
      .filter(file => file.type === 'video/mp4')
      .sort((a, b) => a.width < b.width)[0].link_secure
  const hls =
    response.files &&
    response.files.filter(file => file.quality === 'hls')[0].link_secure
  const thumbnail = response.pictures.sizes.find(v => v.width > 900).link

  return {
    platform: 'vimeo',
    createdAt: new Date(response.created_time),
    retrievedAt: new Date(),
    thumbnail: thumbnail,
    title: response.name,
    userUrl: response.user.link,
    userName: response.user.name,
    userScreenName: response.user.name,
    userProfileImageUrl: response.user.pictures.sizes.find(v => v.width > 75)
      .link,
    aspectRatio: response.width / response.height,
    src: mp4 && {
      mp4: mp4,
      hls: hls,
      thumbnail: thumbnail
      // TODO: subtitles
    }
  }
}

module.exports = {
  getVimeoVideoById
}
