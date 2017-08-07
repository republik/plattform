import fromThemeOrDefaults from '../../utils/fromThemeOrDefaults'

import rules from './rules'
import defaults from './defaults'
import handlers from './handlers'
import components from './components'

export default (theme = {}) => {
  const get = fromThemeOrDefaults(defaults, theme)
  return {
    Components: components(get),
    Plugins: [
      {
        ...handlers(get),
        schema: {
          rules: rules(get)
        }
      }
    ]
  }
}
