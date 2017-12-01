const Autolinker = require('autolinker')
const fetch = require('isomorphic-unfetch')
const {format} = require('url')
const oauth = require('./oauth')

let bearerToken

const getTweetById = async (id, t) => {
  if (!bearerToken) {
    bearerToken = await oauth()
  }

  const response = await fetch(
    `https://api.twitter.com/1.1/statuses/show.json${format({
      query: {
        id,
        tweet_mode: 'extended'
      }
    })}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
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
    throw new Error(
      response.errors.reduce(
        (error, { code, message }) => error.concat(` ${code}: ${message}`),
        'Twitter API Errors:'
      )
    )
  }

  // If a Tweet contains native media (shared with the Tweet user-interface as opposed
  // via a link to elsewhere), there will also be an extended_entities section.
  const extendedMedia =
    (response.extended_entities && response.extended_entities.media) || []

  // Twitter currently only allows
  // 1-4 photos, or
  // 1 video, or
  // 1 animated GIF in one tweet.
  const firstMedium = extendedMedia.shift()
  const playable =
    !!firstMedium &&
    (firstMedium.type === 'video' || firstMedium.type === 'animated_gif')
  const more =
    (!!firstMedium &&
      firstMedium.type === 'photo' &&
      extendedMedia.length > 0 &&
      t.pluralize('api/twitter/morephotos', {
        count: extendedMedia.length
      })) ||
    undefined

  return {
    id: response.id_str,
    createdAt: new Date(response.created_at),
    retrievedAt: new Date(),
    text: response.full_text || response.text,
    html: Autolinker.link(response.full_text || response.text, {
      mention: 'twitter'
    }),
    userId: response.user.id_str,
    userName: response.user.name,
    userScreenName: response.user.screen_name,
    userProfileImageUrl: response.user.profile_image_url_https,
    image: firstMedium && firstMedium.media_url_https,
    more: more,
    playable: playable
  }
}

module.exports = {
  getTweetById
}
