import colors from '../../theme/colors'

export const getFormatLine = ({ title, format, series, repoId, path }) => {
  if (format?.meta) {
    return {
      title: format.meta.title,
      color: format.meta.color || colors[format.meta.kind],
      path: format.meta.path,
    }
  }
  return {}
}
