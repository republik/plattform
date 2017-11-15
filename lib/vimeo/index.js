const fetch = require('isomorphic-unfetch')
const oauth = require('./oauth')

let bearerToken

const getVimeoVideoById = async id => {
  if (!bearerToken) {
    bearerToken = await oauth()
  }

  const response = await fetch(
    `https://api.vimeo.com/videos/${id}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept-Encoding': 'gzip'
      }
    }
  )
  .then(res => res.json())
  .catch(error => {
    console.error(`Error getting Vimeo video with id ${id}:`, error)
    return error
  })

  if (response.error) {
    throw new Error(`Vimeo API Error: ${response.error}`)
  }

  return {
    createdAt: response.created_time,
    userId: response.user.uri,
    userName: response.user.name,
    thumbnail: response.pictures.sizes.find(v => v.width > 900).link
  }
}

module.exports = {
  getVimeoVideoById
}
