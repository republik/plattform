const Autolinker = require('autolinker')
const fetch = require('isomorphic-unfetch')
const oauth = require('./oauth')

let bearerToken

const getTweetById = async id => {
  if (!bearerToken) {
    bearerToken = await oauth()
  }

  const response = await fetch(
    `https://api.twitter.com/1.1/statuses/show.json?id=${id}`,
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
    console.error(`Error getting tweet with id ${id}:`, error)
    return error
  })

  if (response.errors) {
    throw new Error(response.errors.reduce(
      (error, { code, message }) =>
        error.concat(` ${code}: ${message}`),
      'Twitter API Errors:'
    ))
  }

  return {
    id: response.id_str,
    createdAt: new Date(response.created_at),
    retrievedAt: new Date(),
    text: response.text,
    html: Autolinker.link(response.text, {mention: 'twitter'}),
    userId: response.user.id_str,
    userName: response.user.name,
    userScreenName: response.user.screen_name,
    userProfileImageUrl: response.user.profile_image_url_https,
    // TODO: Append any response.entities beyond the first image to html as links.
    image: response.entities &&
      response.entities.media &&
      response.entities.media[0] &&
      response.entities.media[0].media_url_https
  }
}

module.exports = {
  getTweetById
}
