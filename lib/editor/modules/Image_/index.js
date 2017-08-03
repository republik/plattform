import fromThemeOrDefaults from '../../utils/fromThemeOrDefaults'
import schemaPlugin from '../../utils/schemaPlugin'

import rules from './rules'
import defaults from './defaults'

export default (theme = {}) => {
  const get = fromThemeOrDefaults(defaults, theme)
  return {
    Plugins: [schemaPlugin(rules(get))]
  }
}
