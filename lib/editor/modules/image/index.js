import configRules from './rules'
import constants from './constants'
import defaults from './defaults'

export default (opts = { Image: defaults }) => ({
  Constants: constants,
  Rules: configRules(opts)
})
