import React from 'react'
import { getFormatter } from './utils/translate'

import translations from './translations.json'

const MESSAGES = translations.data

export default Component => props => (
  <Component
    {...props}
    t={getFormatter(MESSAGES)}
  />
)
