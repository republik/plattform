import {getFormatter} from './utils/translate'

const MESSAGES = require('./translations.json').data

export default (Component) => (props) => (
  <Component {...props} t={getFormatter(MESSAGES)} />
)
