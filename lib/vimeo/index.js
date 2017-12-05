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

  return {
    platform: 'vimeo',
    createdAt: new Date(response.created_time),
    retrievedAt: new Date(),
    thumbnail: response.pictures.sizes.find(v => v.width > 900).link,
    title: response.name,
    userUrl: response.user.link,
    userName: response.user.name,
    userScreenName: response.user.name,
    userProfileImageUrl: response.user.pictures.sizes.find(v => v.width > 75)
      .link,
    aspectRatio: response.width / response.height
  }
}

module.exports = {
  getVimeoVideoById
}
