const Promise = require('bluebird')

const processRepoImageUrlsInMeta = async (mdast, fn) => {
  const fns = []

  if (mdast.meta) {
    Object.keys(mdast.meta).forEach((key) => {
      if (key.match(/image/i)) {
        fns.push(async () => {
          mdast.meta[key] = await fn(mdast.meta[key])
        })
      }
    })
    const series = mdast.meta.series
    if (series && Array.isArray(series.episodes)) {
      if (series.logo) {
        fns.push(async () => {
          series.logo = await fn(series.logo)
        })
      }
      if (series.logoDark) {
        fns.push(async () => {
          series.logoDark = await fn(series.logoDark)
        })
      }
      series.episodes.forEach((episode) => {
        if (episode.image) {
          fns.push(async () => {
            episode.image = await fn(episode.image)
          })
        }
      })
    }
  }

  return Promise.all(fns.map((fn) => fn()))
}

module.exports = {
  processRepoImageUrlsInMeta,
}
