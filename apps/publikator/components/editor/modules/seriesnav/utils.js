export const isSeriesOverview = (document, titleNodeInput) => {
  const titleNode =
    titleNodeInput || document.findDescendant((node) => node.type === 'TITLE')

  const repoId = titleNode.data.get('repoId')
  return (
    !!repoId &&
    (repoId === titleNode.data.get('series')?.overview?.repoId ||
      document.data.get('series')?.overview?.endsWith(repoId))
  )
}
