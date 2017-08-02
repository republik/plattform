import fromThemeOrDefaults from '../../utils/fromThemeOrDefaults'
import rules from './rules'

const TypographyDefaults = '../Typography/defaults'
const defaults = './defaults'

export default (theme = {}) => {
  const get = fromThemeOrDefaults(
    defaults,
    theme,
    TypographyDefaults
  )
  return {
    Rules: rules(get)
  }
}
