import fromThemeOrDefaults from '../../utils/fromThemeOrDefaults'

import rules from './rules'
import components from './components'
import defaults from './defaults'

export default (theme = {}) => {
  const get = fromThemeOrDefaults(defaults, theme)
  return {
    Components: components(get),
    Rules: rules(get)
  }
}
