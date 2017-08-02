import { fromJS } from 'immutable'

export default (defaultsObj, ...themeObjects) => {
  const defaults = fromJS(defaultsObj)
  const themes = themeObjects.map(fromJS)

  return path => {
    const keyPath = Array.isArray(path)
      ? path
      : path.split('.')
    const theme = themes.find(t => t.hasIn(keyPath))
    if (theme) {
      return theme.getIn(keyPath)
    } else if (!defaults.hasIn(keyPath)) {
      throw new Error(
        `Please provide a default value for theme setting "${keyPath.join(
          '.'
        )}"`
      )
    }
    return defaults.getIn(keyPath)
  }
}
