import configRules from './rules'
import configComponents from './components'
import constants from './constants'
import defaults from './defaults'

export default (opts = { Typography: defaults }) => ({
  Constants: constants,
  Components: configComponents(opts),
  Rules: configRules(opts)
})
