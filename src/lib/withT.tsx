import * as React from 'react'
import { getFormatter } from './utils/translate'

import * as translations from './translations.json'

const MESSAGES = (translations as any).data

export default (Component: any) => (props: any) =>
  <Component {...props} t={getFormatter(MESSAGES)} />
