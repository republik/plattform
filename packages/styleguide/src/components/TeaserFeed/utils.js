export const getFormatLine = ({ title, format, series, repoId, path }) => {
  if (format?.meta) {
    return {
      title: format.meta.title,
      color: format.meta.color || `var(--color-${format.meta.kind})`,
      path: format.meta.path,
    }
  }
  // if (series) {
  //   const currentEpisode = series.episodes.find(
  //     episode =>
  //       (path && path === episode.document?.meta.path) ||
  //       (repoId && repoId === episode.document?.repoId)
  //   )
  //   const starterEpisode = series.episodes.find(episode =>
  //     episode.label?.match(/Auftakt/i)
  //   )

  //   if (currentEpisode && currentEpisode === starterEpisode) {
  //     return {}
  //   }
  //   // back off if title already contain series title to avoid doubling
  //   if (
  //     typeof title === 'string' &&
  //     title.toLowerCase().indexOf(series.title.toLowerCase()) !== -1
  //   ) {
  //     return {}
  //   }

  //   return {
  //     title: currentEpisode?.label
  //       ? `${series.title}${series.title.match(/\?$/) ? '' : ','} ${
  //           currentEpisode.label
  //         }`
  //       : series.title,
  //     path: (starterEpisode || series.episodes[0])?.document?.meta.path,
  //     logo: series.logo,
  //     logoDark: series.logoDark
  //   }
  // }
  return {}
}
