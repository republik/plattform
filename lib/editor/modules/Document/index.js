import fromThemeOrDefaults from '../../utils/fromThemeOrDefaults'
import schemaPlugin from '../../utils/schemaPlugin'
import rules from './rules'
import components from './components'

import TypographyDefaults from '../Typography/defaults'
import defaults from './defaults'

export default (theme = {}) => {
  const get = fromThemeOrDefaults(
    defaults,
    theme,
    TypographyDefaults
  )
  return {
    Components: components(get),
    Plugins: [schemaPlugin(rules(get))]
  }
}
