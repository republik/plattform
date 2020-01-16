const { descending, ascending } = require('d3-array')
const fetch = require('isomorphic-unfetch')

const { VIMEO_APP_ACCESS_TOKEN } = process.env

if (!VIMEO_APP_ACCESS_TOKEN) {
  console.warn("missing VIMEO_APP_ACCESS_TOKEN. Vimeo embeds won't work.")
}

const getVimeoVideoById = async id => {
  if (!VIMEO_APP_ACCESS_TOKEN) {
    throw new Error('missing VIMEO_APP_ACCESS_TOKEN')
  }

  const response = await fetch(`https://api.vimeo.com/videos/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${VIMEO_APP_ACCESS_TOKEN}`,
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
    response.files.length > 0 &&
    response.files
      .filter(file => file.type === 'video/mp4')
      .sort((a, b) => descending(a.width, b.width))[0].link_secure
  const hls =
    response.files &&
    response.files.length > 0 &&
    response.files.find(file => file.quality === 'hls').link_secure
  const isLiveOrScheduled = response.duration === 0 &&
    response.embed &&
    response.embed.badges &&
    response.embed.badges.live &&
    !response.embed.badges.live.archived
  const aspectRatio = isLiveOrScheduled
    // Live videos report an incorrect 4:3 aspect ratio in the API before they're archived.
    ? 16.0 / 9
    : response.width / response.height

  const roundAspectRatio = ar => Math.round(ar * 100) / 100
  const roundedAspectRatio = roundAspectRatio(aspectRatio)
  const thumbnail = [].concat(response.pictures.sizes).sort(
    (a, b) => ascending(
      Math.abs(roundAspectRatio(a.width / a.height) - roundedAspectRatio),
      Math.abs(roundAspectRatio(b.width / b.height) - roundedAspectRatio)
    ) || descending(a.width, b.width)
  )[0].link

  return {
    platform: 'vimeo',
    id,
    createdAt: new Date(response.created_time),
    retrievedAt: new Date(),
    thumbnail: thumbnail,
    title: response.name,
    userUrl: response.user.link,
    userName: response.user.name,
    userScreenName: response.user.name,
    userProfileImageUrl: response.user.pictures.sizes.find(v => v.width > 75)
      .link,
    aspectRatio,
    src: mp4 && !isLiveOrScheduled ? {
      mp4: mp4,
      hls: hls,
      thumbnail: thumbnail
      // TODO: subtitles
    } : null,
    durationMs: response.duration * 1000
  }
}

module.exports = {
  getVimeoVideoById,
  // manually keep in sync with backend-modules/packages/documents/lib/process.js
  // until embeds are in their own module
  imageKeys: ['thumbnail', 'userProfileImageUrl']
}
