import configRules from './rules'
import configComponents from './components'
import constants from './constants'
import defaults from './defaults'

export default (opts = { Link: defaults }) => ({
  Constants: constants,
  Rules: configRules(opts),
  Components: configComponents(opts)
})
