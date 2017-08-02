import fromThemeOrDefaults from '../../utils/fromThemeOrDefaults'

import rules from './rules'
import defaults from './defaults'

export default (theme = {}) => {
  const get = fromThemeOrDefaults(defaults, theme)
  return {
    Rules: rules(get)
  }
}
