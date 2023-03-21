const { getAudioCover } = require('../../lib/meta')

module.exports = {
  credits: (meta) => {
    return Array.isArray(meta.credits) // old data, e.g. pre-reindex
      ? meta.credits
      : meta.credits?.children
  },

  contributors: (meta) => meta.contributors || [],

  audioCover: getAudioCover,
}
