const fetch = require('isomorphic-unfetch')
const appAuth = require('./appAuth')

let bearerToken

const getTweetById = async id => {
  if (!bearerToken) {
    bearerToken = await appAuth()
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

  console.log(response)

  if (response.errors) {
    throw new Error(response.errors.reduce(
      (error, { code, message }) =>
        error.concat(` ${code}: ${message}`),
      'Twitter API Errors:'
    ))
  }

  return {
    id: response.id_str,
    createdAt: response.created_at,
    text: response.text,
    userId: response.user.id_str,
    userName: response.user.name,
    userScreenName: response.user.screen_name
  }
}

module.exports = {
  getTweetById
}
